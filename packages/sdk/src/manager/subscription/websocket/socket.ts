import mitt from "mitt";
import { Options as RWSOptions } from "reconnecting-websocket";

import {
  WebSocketSubscriptionItem,
  WebSocketRequest,
  WebSocketMethodEnum,
  WebSocketEvents,
  WebSocketConfig,
  WebSocketMessageResponse,
  WebSocketTopicEnum,
  NativeTickerData,
  WebSocketAckMessageResponse,
} from "./types";
import {
  generateListenerId,
  generateRequestId,
  isAckMessageResponse,
  messageTransform,
} from "./utils";
import { Logger, LoggerOptions } from "@/logger";
import { MyxErrorCode, MyxSDKError } from "@/manager/error/const";
import ReconnectingWebSocket from "reconnecting-websocket";
import { md5 } from "@/crypto/md5";

// subscription info
export interface Subscription {
  topic: string;
  id: string;
  callbacks: Set<(data: any) => void>; // support multiple callback
}

const DEFAULT_CONFIG: WebSocketConfig = {
  url: "",
  initialReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  reconnectMultiplier: 1.5,
  maxReconnectAttempts: 10,
  maxEnqueuedMessages: 100,
  requestTimeout: 10000,
  heartbeatInterval: 10000,
  heartbeatMessage: "ping",
  noMessageTimeout: 5000,
  connectionTimeout: 1000,
};

export class MyxWebSocketClient {
  private ws: ReconnectingWebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions = new Map<string, Subscription>();
  /**
   * waiting requests
   */
  private waitingRequests = new Map<
    string,
    {
      onSuccess: Set<(data: Record<string, any>) => void>;
      onError: Set<(error: MyxSDKError) => void>;
    }
  >();
  /**
   * event bus
   */
  private eventBus = mitt<WebSocketEvents>();
  private heartbeatIntervalId: NodeJS.Timeout | null = null;

  /**
   * Track if this is the first connection or a reconnection
   */
  private isFirstConnection = true;

  /**
   *
   */
  private lastMessageTime = 0;

  /**
   * logger
   */
  private logger: Logger;

  constructor(config?: Partial<WebSocketConfig & LoggerOptions>) {
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
      ...DEFAULT_CONFIG,
      // user config
      ...args,
    } as Required<WebSocketConfig>;

    /**
     * init logger
     */
    this.logger = new Logger({
      logLevel: config?.logLevel,
    });

    this.logger.debug("WebSocketClient constructor", this.config);
  }

  /**
   * connect WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
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
          connectionTimeout: this.config.connectionTimeout,
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

  private async onBeforeReSubscribe() {
    if (this.config.onBeforeReSubscribe) {
      await this.config.onBeforeReSubscribe();
    }
    return true;
  }

  /**
   * setup event listeners
   */
  private setupEventListeners(
    resolve: () => void,
    reject: (reason?: any) => void
  ) {
    if (!this.ws) return;

    this.ws.onopen = async (event) => {
      this.eventBus.emit("open", event);
      console.log("onOPen");
      this.lastMessageTime = Date.now();
      this.timeoutHeartbeat();

      // Only resubscribe on reconnection, not on first connection
      if (!this.isFirstConnection) {
        this.onBeforeReSubscribe().then(() => this.resubscribeAll());
      }
      this.isFirstConnection = false;
      resolve();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
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
      // Mark that this is a reconnection, not first connection
      this.isFirstConnection = false;
    });

    // listen max reconnect attempts event
    (this.ws as any).addEventListener("maxreconnectattempts", () => {
      this.eventBus.emit("maxreconnectattempts", undefined);
    });
  }

  /**
   * reply ping message
   */
  private pong(data: string) {
    this.send({
      request: WebSocketMethodEnum.Pong,
      args: data,
    });
  }

  /** request */
  public request(param: WebSocketRequest) {
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId(param);
      if (this.waitingRequests.has(requestId)) {
        this.waitingRequests.get(requestId)?.onSuccess.add(resolve);
        this.waitingRequests.get(requestId)?.onError.add(reject);
      } else {
        this.waitingRequests.set(requestId, {
          onSuccess: new Set([resolve]),
          onError: new Set([reject]),
        });
      }
      this.send(param);
    });
  }

  /**
   * subscribe
   * support multiple consumers subscribing to the same listenerId, only send one subscription message
   * support batch subscription: pass an array of subscriptions to subscribe multiple topics at once
   */
  public subscribe(
    subscription: WebSocketSubscriptionItem | WebSocketSubscriptionItem[],
    callback: (data: any) => void
  ) {
    const subscriptionList = Array.isArray(subscription)
      ? subscription
      : [subscription];
      console.log('sinscribes:', subscriptionList)
    this.logger.debug('subscriptionList:', subscriptionList)
    const newSubscriptionIds: string[] = [];
    // track processed subscriptionIds to avoid duplicate processing
    const processedIds = new Set<string>();
    subscriptionList.forEach((subscriptionItem) => {
      const subscriptionId = generateListenerId(subscriptionItem);
      this.logger.debug('subscriptionId:', subscriptionId)
      // skip if already processed in this batch
      if (processedIds.has(subscriptionId)) {
        return;
      }
      processedIds.add(subscriptionId);

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
          topic: subscriptionItem.topic,
          callbacks: new Set([callback]),
        };

        // save subscription
        this.subscriptions.set(subscriptionId, subscriptionObj);
        newSubscriptionIds.push(subscriptionId);
        this.logger.debug(`create new subscription: ${subscriptionId}`);
      }
    });

    // batch send all new subscriptions in one request
    if (newSubscriptionIds.length > 0) {
      this.send({
        request: WebSocketMethodEnum.SubscribeV2,
        args: newSubscriptionIds,
      });
    }
  }

  /**
   * unsubscribe
   * unsubscribe by callback, only send unsubscribe message when all callbacks are removed
   * support batch unsubscribe: pass an array of subscriptions to unsubscribe multiple topics at once
   */
  public unsubscribe(
    subscriptions: WebSocketSubscriptionItem | WebSocketSubscriptionItem[],
    callback: (data: any) => void
  ): void {
    if (!subscriptions) return;

    const subscriptionList = Array.isArray(subscriptions)
      ? subscriptions
      : [subscriptions];

    const subscriptionsToUnsubscribe: string[] = [];
    // track processed subscriptionIds to avoid duplicate processing
    const processedIds = new Set<string>();

    subscriptionList.forEach((subscriptionItem) => {
      const subscriptionId = generateListenerId(subscriptionItem);
      
      // skip if already processed in this batch
      if (processedIds.has(subscriptionId)) {
        return;
      }
      processedIds.add(subscriptionId);

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
    });

    // batch send unsubscribe message for subscriptions that have no callbacks
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

    if (
      this.ws.readyState !== WebSocket.OPEN &&
      this.ws.readyState !== WebSocket.CONNECTING
    ) {
      this.reconnect();
    }
    this.ws.send(message);
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
      if (this.ws.readyState !== WebSocket.CONNECTING) {
        this.ws.reconnect();
      }
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
   * private methods
   */

  /**
   * handle received message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebSocketMessageResponse;
      // update last message time
      this.lastMessageTime = Date.now();
      if (data.type === "ping") {
        this.logger.debug("Ping Message received");
        // reply pong message by microtask
        queueMicrotask(() => {
          this.pong(data.data as string);
        });
        return;
      }
      if (isAckMessageResponse(data)) {
        this.handleAckMessage(data as WebSocketAckMessageResponse);

        return;
      }

      // handle subscription message
      this.handleSubscriptionMessage(data);
    } catch (error) {
      this.logger.error(`Failed to parse WebSocket message: ${error}`);
    }
  }

  /**
   * handle Ack Message
   */
  private handleAckMessage(data: WebSocketAckMessageResponse): void {
    let requestId: string;
    switch (data.type) {
      case WebSocketMethodEnum.SignIn:
        requestId = generateRequestId({
          request: data.type,
          args: "",
        });
        break;
      default:
        requestId = generateRequestId({
          request: data.type,
          args: data.data.data,
        } as WebSocketRequest);
        break;
    }
    const waitRequest = this.waitingRequests.get(requestId);
    const isSuccess = (data as WebSocketAckMessageResponse).data.code === 9200;
    if (!isSuccess) {
      this.logger.error(`Ack Message:${data.type} received`, data);
      this.eventBus.emit("error", data as unknown as Event);
    } else {
      this.logger.debug(`AcK Message:${data.type} received`);
    }

    // emit request error callback
    if (waitRequest?.onError.size && !isSuccess) {
      waitRequest.onError.forEach((reject) => {
        reject(new MyxSDKError(MyxErrorCode.RequestFailed, "Request failed"));
      });
    }
    // emit request success callback
    if (waitRequest?.onSuccess.size && isSuccess) {
      waitRequest.onSuccess.forEach((resolve) => {
        resolve(data.data);
      });
    }
  }

  /**
   * handle subscription message
   */
  private handleSubscriptionMessage(data: WebSocketMessageResponse): void {
    // dispatch message by subscriptionId

    // transform data
    let dataParsed = messageTransform(data);

    const subscriptionId = dataParsed.type;
    this.logger.debug(`handle subscription message: ${subscriptionId}`);

    const subscription = this.subscriptions.get(subscriptionId);
    // if subscription not found, return
    if (!subscription) return;

    subscription.callbacks.forEach((callback) => {
      try {
        callback(dataParsed);
      } catch (error) {
        this.logger.error(`Callback Error (${subscriptionId}): ${error}`);
      }
    });
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
    if (
      Date.now() - this.lastMessageTime >
      (this.config.noMessageTimeout || DEFAULT_CONFIG.noMessageTimeout)
    ) {
      this.logger.debug("no message timeout");
      const hasActiveSubscription = this.subscriptions.size > 0;
      // if no active subscription, close the connection
      if (!hasActiveSubscription) {
        this.ws?.close();
      } else {
        // if response time is too long, reconnect the connection
        this.reconnect();
      }
    }
    this.heartbeatIntervalId = setTimeout(() => {
      this.timeoutHeartbeat();
    }, this.config.heartbeatInterval);
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
