export enum MyxErrorCode {
  SocketNotConnected = "SOCKET_NOT_CONNECTED",
  SocketNotInited = "SOCKET_NOT_INITED",
  ParamError = "PARAM_ERROR",
  InvalidChainId = "INVALID_CHAIN_ID",
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
