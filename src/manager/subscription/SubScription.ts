import { MyxWebSocketClient } from "./websocket/socket.js";
import {
  KlineResolution,
  WebSocketMethodEnum,
  WebSocketTopicEnum,
  WebSocketEvents,
} from "./websocket/types.js";
import {
  OnKlineCallback,
  OnOrderCallback,
  OnPositionCallback,
  OnTickersCallback,
} from "./types/index.js";
import { Logger } from "@/logger";
import { ConfigManager } from "@/manager/config";
import { WEBSOCKET_URL } from "@/manager/const";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { Signer } from "ethers";

export class SubScription {
  private wsClient: MyxWebSocketClient;

  private configManager: ConfigManager;
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    this.configManager = configManager;
    this.logger = logger;
    let socketUrl: string = WEBSOCKET_URL.MainNet;
    if (configManager.getConfig().isBetaMode) {
      socketUrl = WEBSOCKET_URL.BetaNet;
    } else if (configManager.getConfig().isTestnet) {
      socketUrl = WEBSOCKET_URL.TestNet;
    }
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
    // this.logger.debug(`subscribe tickers ${globalIds}`);
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
    // this.logger.debug(`unsubscribe tickers ${globalIds}`);
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

  private _preSigner: Signer | null = null;
  private _preUserAddress: string | null = null;
  private async getSdkAuthParams() {
    const config = this.configManager.getConfig();
    if (!config.signer) throw new MyxSDKError(MyxErrorCode.InvalidSigner);
    let userAddress = this._preUserAddress;
    if (config.signer !== this._preSigner) {
      userAddress = await config.signer.getAddress();
      this._preUserAddress = userAddress;
      this._preSigner = config.signer;
    }

    if (!userAddress) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner);
    }
    return {
      userAddress
    }
  }
  private clientAuth = false;
  private prevUserAddress: string | null = null;
  /**
   * with auth methods
   */
  public async auth(isReconnect = false) {
    const { userAddress } = await this.getSdkAuthParams();

    if (userAddress === this.prevUserAddress && this.clientAuth && !isReconnect) {
      // client auth success
      return Promise.resolve();
    }

    this.logger.debug(`sdkaccount: ${userAddress}`);
    await this.wsClient
      .request({
        request: WebSocketMethodEnum.SignIn,
        args: `sdkaccount.${userAddress}`,
      })
      .then(() => {
        // client auth success
        this.logger.debug(`auth success ${userAddress}`);
        this.clientAuth = true;
        this.prevUserAddress = userAddress;
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
