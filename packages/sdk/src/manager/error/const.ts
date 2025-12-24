export enum MyxErrorCode {
  SocketNotConnected = "SOCKET_NOT_CONNECTED",
  SocketNotInited = "SOCKET_NOT_INITED",
  ParamError = "PARAM_ERROR",
  InvalidChainId = "INVALID_CHAIN_ID",
  InvalidAccessToken = "INVALID_ACCESS_TOKEN",
  RequestFailed = "REQUEST_FAILED",
  InvalidSigner = "INVALID_SIGNER",
  InvalidPrivateKey = "INVALID_PRIVATE_KEY",
  InsufficientBalance = "INSUFFICIENT_BALANCE",
  Timeout = "TIMEOUT",
  OperationFailed = "OPERATION_FAILED",
  InvalidSeamlessWallet = "INVALID_SEAMLESS_WALLET",
  InsufficientMarginBalance = "INSUFFICIENT_MARGIN_BALANCE",
  InvalidBrokerAddress = "INVALID_BROKER_ADDRESS",
}

export class MyxSDKError extends Error {
  constructor(code: MyxErrorCode, message?: string) {
    super(message);
    this.name = code;
  }

  toJSON() {
    return {
      code: this.name,
      message: this.message,
    };
  }

  toString() {
    return `[MYX-ERROR-${this.name}]: ${this.message}`;
  }
}
