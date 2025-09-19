import mitt from "mitt";
import { Options as RWSOptions } from "reconnecting-websocket";

import {
  WebSocketSubscriptionItem,
  WebSocketRequest,
  WebSocketMethodEnum,
  WebSocketEvents,
  WebSocketConfig,
} from "./types";
import { generateListenerId } from "./utils";
import { Logger, LoggerOptions } from "@/logger";
import { MyxErrorCode, MyxSDKError } from "@/manager/error/const";
import ReconnectingWebSocket from "reconnecting-websocket";

// subscription info
export interface Subscription {
  topic: string;
  id: string;
  callbacks: Set<(data: any) => void>; // support multiple callback
}

// request info
export interface PendingRequest {
  id: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
}

// config

export class MyxWebSocketClient {
  private ws: ReconnectingWebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private subscriptions = new Map<string, Subscription>();
  private eventBus = mitt<WebSocketEvents>();
  private isDestroyed = false;
  private heartbeatIntervalId: NodeJS.Timeout | null = null;

  /**
   *
   */
  private lastMessageTime = 0;

  /**
   * logger
   */
  private logger: Logger;

  constructor(config?: WebSocketConfig & LoggerOptions) {
    /**
     * init config
     */
    const _config = {
      ...config,
      logLevel: config?.logLevel || "info",
    };
    const { logLevel, ...args } = _config;
    this.config = {
      // default config
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      reconnectMultiplier: 1.5,
      maxReconnectAttempts: 10,
      maxEnqueuedMessages: 100,
      requestTimeout: 10000,
      heartbeatInterval: 30000,
      heartbeatMessage: "ping",
      noMessageTimeout: 30000,
      // user config
      ...args,
    } as Required<WebSocketConfig>;
    /**
     * init logger
     */
    this.logger = new Logger({
      logLevel: config?.logLevel,
    });
  }

  /**
   * connect WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        // create reconnecting-websocket config
        const rwsConfig: RWSOptions = {
          maxReconnectionDelay: this.config.maxReconnectDelay,
          minReconnectionDelay: this.config.initialReconnectDelay,
          reconnectionDelayGrowFactor: this.config.reconnectMultiplier,
          maxRetries: this.config.maxReconnectAttempts,
          maxEnqueuedMessages: this.config.maxEnqueuedMessages,
        };

        this.ws = new ReconnectingWebSocket(
          this.config.url,
          this.config.protocols,
          rwsConfig
        );

        this.setupEventListeners(resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * setup event listeners
   */
  private setupEventListeners(
    resolve: () => void,
    reject: (reason?: any) => void
  ) {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      this.eventBus.emit("open", event);
      this.lastMessageTime = Date.now();
      this.timeoutHeartbeat();
      this.resubscribeAll();
      resolve();
    };

    this.ws.onmessage = (event) => {
      this.eventBus.emit("message", event);
    };

    this.ws.onclose = (event) => {
      this.eventBus.emit("close", event as CloseEvent);
      this.stopHeartbeatTimer();
    };

    this.ws.onerror = (event) => {
      this.eventBus.emit("error", event as unknown as Event);
      reject(event);
    };

    // listen reconnect event
    (this.ws as any).addEventListener("reconnecting", (event: any) => {
      this.eventBus.emit("reconnecting", { detail: event.detail || 0 });
    });

    // listen max reconnect attempts event
    (this.ws as any).addEventListener("maxreconnectattempts", () => {
      this.eventBus.emit("maxreconnectattempts", undefined);
    });
  }

  /**
   * subscribe topic
   * 支持多个消费者订阅相同的 listenerId，只发送一次订阅消息
   */
  public subscribe(
    subscription: WebSocketSubscriptionItem,
    callback: (data: any) => void
  ) {
    const subscriptionId = generateListenerId(subscription);
    if (this.subscriptions.has(subscriptionId)) {
      // if the subscription already exists, only add the new callback
      const existingSubscription = this.subscriptions.get(subscriptionId)!;
      existingSubscription.callbacks.add(callback);
      this.logger.debug(
        `add callback to existing subscription: ${subscriptionId}`
      );
    } else {
      // create new subscription
      const subscriptionObj: Subscription = {
        id: subscriptionId,
        topic: subscription.topic,
        callbacks: new Set([callback]),
      };

      // save subscription
      this.subscriptions.set(subscriptionId, subscriptionObj);
      this.logger.debug(`create new subscription: ${subscriptionId}`);

      this.send({
        request: WebSocketMethodEnum.SubscribeV2,
        args: subscriptionId,
      });
    }
  }

  /**
   * unsubscribe
   * unsubscribe by callback, only send unsubscribe message when all callbacks are removed
   */
  public unsubscribe(
    subscriptions: WebSocketSubscriptionItem,
    callback: (data: any) => void
  ): void {
    if (!subscriptions) return;

    const subscriptionsToUnsubscribe: string[] = [];

    const subscriptionId = generateListenerId(subscriptions);
    const subscriptionObj = this.subscriptions.get(subscriptionId);

    if (subscriptionObj) {
      // remove the specified callback
      subscriptionObj.callbacks.delete(callback);
      this.logger.debug(`remove callback from subscription: ${subscriptionId}`);

      // if there are no callbacks, mark as need to unsubscribe
      if (subscriptionObj.callbacks.size === 0) {
        this.subscriptions.delete(subscriptionId);
        subscriptionsToUnsubscribe.push(subscriptionId);
        this.logger.debug(
          `subscription ${subscriptionId} has no callbacks, will unsubscribe`
        );
      }
    }

    // only send unsubscribe message to subscriptions that have no callbacks
    if (subscriptionsToUnsubscribe.length > 0) {
      this.send({
        request: WebSocketMethodEnum.UnsubscribeV2,
        args: subscriptionsToUnsubscribe,
      });
    }
  }

  /**
   * send message
   */
  public send(data: WebSocketRequest) {
    const message = typeof data === "string" ? data : JSON.stringify(data);

    if (!this.ws) {
      throw new MyxSDKError(
        MyxErrorCode.SocketNotConnected,
        "WebSocket is not connected"
      );
    }

    this.ws?.send(message);
  }

  /**
   * disconnect
   */
  public disconnect(): void {
    this.stopHeartbeatTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * reconnect
   */
  public reconnect(): void {
    if (this.ws) {
      this.ws.reconnect();
    } else {
      this.connect().catch((err) => {
        this.logger.error(err);
      });
    }
  }

  /**
   * check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * get connection status
   */
  public getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * get reconnect count
   */
  public getRetryCount(): number {
    return this.ws?.retryCount ?? 0;
  }

  /**
   * event listen
   */
  public on<K extends keyof WebSocketEvents>(
    event: K,
    handler: (data: WebSocketEvents[K]) => void
  ): void {
    this.eventBus.on(event, handler);
  }

  /**
   * remove event listen
   */
  public off<K extends keyof WebSocketEvents>(
    event: K,
    handler: (data: WebSocketEvents[K]) => void
  ): void {
    this.eventBus.off(event, handler);
  }

  /**
   * get all subscriptions
   */
  public getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * clear all subscriptions
   */
  public clearSubscriptions(): void {
    this.subscriptions.clear();
  }

  /**
   * private methods
   */

  /**
   * handle received message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (data.topic) {
        this.handleSubscriptionMessage(data);
      }
    } catch (error) {
      this.logger.error(`Failed to parse WebSocket message: ${error}`);
    }
  }

  /**
   * handle subscription message
   */
  private handleSubscriptionMessage(data: any): void {
    // dispatch message by subscriptionId
    if (data.subscriptionId) {
      const subscription = this.subscriptions.get(data.subscriptionId);
      if (subscription) {
        subscription.callbacks.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            this.logger.error(
              `Callback Error (${data.subscriptionId}): ${error}`
            );
          }
        });
      }
      return;
    }
  }

  /**
   * resubscribe all after reconnect (autoResubscribe is true)
   */
  private resubscribeAll(): void {
    if (this.subscriptions.size === 0) return;
    this.logger.debug("resubscribe all...");

    const subscriptionIds: string[] = Array.from(
      this.subscriptions.values()
    ).map((subscription) => subscription.id);

    if (subscriptionIds.length > 0) {
      this.send({
        request: WebSocketMethodEnum.SubscribeV2,
        args: subscriptionIds,
      });
      this.logger.debug(`resubscribe ${subscriptionIds.length} topics`);
    }
  }

  /**
   * start heartbeat (noMessageTimeout is reached)
   */
  private timeoutHeartbeat(): void {
    this.stopHeartbeatTimer();
    if (Date.now() - this.lastMessageTime > this.config.noMessageTimeout) {
      const hasActiveSubscription = this.subscriptions.size > 0;
      if (!hasActiveSubscription) {
        this.ws?.close();
      } else {
        this.heartbeatIntervalId = setTimeout(() => {
          this.timeoutHeartbeat();
        }, this.config.heartbeatInterval);
      }
    }
  }

  /**
   * stop heartbeat (heartbeatInterval is reached)
   */
  private stopHeartbeatTimer(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }
}
