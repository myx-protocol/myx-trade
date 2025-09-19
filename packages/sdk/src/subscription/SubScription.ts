import { MyxWebSocketClient } from "./websocket/socket";
import {
  KlineResolution,
  WebSocketMethodEnum,
  WebSocketTopicEnum,
  WebSocketConfig,
} from "./websocket/types";
import {
  OnKlineCallback,
  OnOrderCallback,
  OnPositionCallback,
  OnTickersAllCallback,
  OnTickersCallback,
} from "./types";
import { Logger } from "@/logger";
import { ConfigManager } from "@/manager/config";
import { WEBSOCKET_URL } from "@/manager/const";

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
  subscribeTickers(globalId: number, callback: OnTickersCallback) {
    this.logger.debug(`subscribe tickers ${globalId}`);
    this.wsClient.subscribe(
      {
        topic: WebSocketTopicEnum.Ticker,
        params: {
          globalId: globalId,
        },
      },
      callback
    );
  }

  unsubscribeTickers(globalId: number, callback: OnTickersCallback) {
    this.logger.debug(`unsubscribe tickers ${globalId}`);
    this.wsClient.unsubscribe(
      {
        topic: WebSocketTopicEnum.Ticker,
        params: {
          globalId,
        },
      },
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

  // /**
  //  * tickers all subscription methods
  //  */
  // subscribeTickersAll(callback: OnTickersAllCallback) {
  //   this.logger.debug(`subscribe tickers all`, this.configManager.getConfig());
  //   this.wsClient.subscribe(
  //     {
  //       topic: WebSocketTopicEnum.TickerAll,
  //     },
  //     callback
  //   );
  // }

  // unsubscribeTickersAll(callback: OnTickersAllCallback) {
  //   this.logger.debug(`unsubscribe tickers all`);
  //   this.wsClient.unsubscribe(
  //     {
  //       topic: WebSocketTopicEnum.TickerAll,
  //     },
  //     callback
  //   );
  // }

  /**
   * with auth methods
   */
  auth(accessToken: string) {
    this.logger.debug(`auth ${accessToken}`);
    this.wsClient.send({
      request: WebSocketMethodEnum.SignIn,
      args: `sdk.${accessToken}`,
    });
  }

  /**
   * these methods are private data of the account, please ensure that the auth method is called before calling these methods
   */

  /**
   * position subscription methods
   */
  subscribePosition(callback: OnPositionCallback) {
    this.logger.debug(`subscribe position`);
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
  subscribeOrder(callback: OnOrderCallback) {
    this.logger.debug(`subscribe order`);
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
}
