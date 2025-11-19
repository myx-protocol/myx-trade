import { MyxWebSocketClient } from "./websocket/socket";
import {
  KlineResolution,
  WebSocketMethodEnum,
  WebSocketTopicEnum,
  WebSocketConfig,
  WebSocketEvents,
} from "./websocket/types";
import {
  OnKlineCallback,
  OnOrderCallback,
  OnPositionCallback,
  OnTickersCallback,
} from "./types";
import { Logger } from "@/logger";
import { ConfigManager } from "@/manager/config";
import { WEBSOCKET_URL } from "@/manager/const";
import { MyxErrorCode, MyxSDKError } from "../error/const";

export class SubScription {
  private wsClient: MyxWebSocketClient;

  private configManager: ConfigManager;
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    this.configManager = configManager;
    this.logger = logger;
    const socketUrl = configManager.getConfig()?.isTestnet
      ? WEBSOCKET_URL.TestNet
      : WEBSOCKET_URL.MainNet;

    this.wsClient = new MyxWebSocketClient({
      logLevel: this.configManager.getConfig()?.logLevel,
      url: socketUrl,
      ...this.configManager.getConfig()?.socketConfig,
      onBeforeReSubscribe: () => {
        if (this.clientAuth) {
          return this.auth(true).then(() => {
            this.logger.debug("reconnect auth success");
          });
        }
      },
    });
  }

  /**
   *
   * getters
   */

  public get isConnected() {
    return this.wsClient.isConnected();
  }

  /**
   * public methods
   */

  public connect() {
    this.wsClient.connect();
  }

  public disconnect() {
    this.wsClient.disconnect();
  }

  public reconnect() {
    this.wsClient.reconnect();
  }

  /**
   * tickers subscription methods
   */
  subscribeTickers(globalIds: number | number[], callback: OnTickersCallback) {
    this.logger.debug(`subscribe tickers ${globalIds}`);
    const globalIdsList = Array.isArray(globalIds) ? globalIds : [globalIds];
    this.wsClient.subscribe(
      globalIdsList.map((globalId) => ({
        topic: WebSocketTopicEnum.Ticker,
        params: { globalId },
      })),
      callback
    );
  }
  unsubscribeTickers(
    globalIds: number | number[],
    callback: OnTickersCallback
  ) {
    this.logger.debug(`unsubscribe tickers ${globalIds}`);
    const globalIdsList = Array.isArray(globalIds) ? globalIds : [globalIds];
    this.wsClient.unsubscribe(
      globalIdsList.map((globalId) => ({
        topic: WebSocketTopicEnum.Ticker,
        params: { globalId },
      })),
      callback
    );
  }

  /**
   * kline subscription methods
   */
  subscribeKline(
    globalId: number,
    resolution: KlineResolution,
    callback: OnKlineCallback
  ) {
    this.logger.debug(`subscribe kline ${globalId} ${resolution}`);
    this.wsClient.subscribe(
      {
        topic: WebSocketTopicEnum.Kline,
        params: {
          globalId: globalId,
          resolution: resolution,
        },
      },
      callback
    );
  }

  unsubscribeKline(
    globalId: number,
    resolution: KlineResolution,
    callback: OnKlineCallback
  ) {
    this.logger.debug(`unsubscribe kline ${globalId} ${resolution}`);
    this.wsClient.unsubscribe(
      {
        topic: WebSocketTopicEnum.Kline,
        params: {
          globalId: globalId,
          resolution: resolution,
        },
      },
      callback
    );
  }

  private async getAccessToken() {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return accessToken;
  }
  private clientAuth = false;
  private prevAccessToken = "";
  /**
   * with auth methods
   */
  public async auth(isReconnect = false) {
    const token = await this.getAccessToken();
    this.logger.debug('new access token-->', token, 'prevAccessToken-->', this.prevAccessToken, 'clientAuth-->', this.clientAuth, 'isReconnect-->', isReconnect)
    if (token === this.prevAccessToken && this.clientAuth && !isReconnect) {
      // client auth success
      return Promise.resolve();
    }
    this.logger.debug(`auth ${token}`);
    await this.wsClient
      .request({
        request: WebSocketMethodEnum.SignIn,
        args: `sdk.${token}`,
      })
      .then(() => {
        // client auth success
        this.logger.debug(`auth success ${token}`);
        this.prevAccessToken = token;
        this.clientAuth = true;
      });
  }

  /**
   * these methods are private data of the account, please ensure that the auth method is called before calling these methods
   */

  /**
   * position subscription methods
   */
  async subscribePosition(callback: OnPositionCallback) {
    this.logger.debug(`subscribe position`);
    await this.auth();
    this.wsClient.subscribe(
      {
        topic: WebSocketTopicEnum.Position,
      },
      callback
    );
  }

  unsubscribePosition(callback: OnPositionCallback) {
    this.logger.debug(`unsubscribe position`);
    this.wsClient.unsubscribe(
      {
        topic: WebSocketTopicEnum.Position,
      },
      callback
    );
  }

  /**
   * order subscription methods
   */
  async subscribeOrder(callback: OnOrderCallback) {
    this.logger.debug(`subscribe order`);
    await this.auth();
    this.wsClient.subscribe(
      {
        topic: WebSocketTopicEnum.Order,
      },
      callback
    );
  }

  unsubscribeOrder(callback: OnOrderCallback) {
    this.logger.debug(`unsubscribe order`);
    this.wsClient.unsubscribe(
      {
        topic: WebSocketTopicEnum.Order,
      },
      callback
    );
  }

  /**
   * event listen
   */
  on<K extends keyof WebSocketEvents>(
    event: K,
    handler: (data: WebSocketEvents[K]) => void
  ): void {
    this.wsClient.on(event, handler);
  }

  /**
   * event remove listen
   */

  off<K extends keyof WebSocketEvents>(
    event: K,
    handler: (data: WebSocketEvents[K]) => void
  ): void {
    this.wsClient.off(event, handler);
  }
}
