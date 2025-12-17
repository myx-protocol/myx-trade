import { BaseResponse } from "../type";

export type ForwarderTxParams = {
  from: string;
  to: string;
  value: string;
  gas: string;
  nonce: string;
  data: string;
  deadline: number
  signature: string
}

export type FetchForwarderGetParams = {
  requestId: string
}

export enum ForwarderGetStatus {
  // 1:执行中，2:广播到链上时失败，3:超时取消，9:已执行
  EXECUTING = 1,
  BROADCAST_FAILED = 2,
  TIMEOUT_CANCEL = 3,
  EXECUTED = 9,
}

export type FetchForwarderGetResponseData = {
  status: ForwarderGetStatus
  txHash: string
  reason: string
}

export type FetchForwarderGetResponse = BaseResponse<FetchForwarderGetResponseData>
