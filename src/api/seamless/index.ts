import { BaseResponse } from "../type.js";

export type ForwarderTxParams = {
  from: string;
  to: string;
  value: string;
  gas: string;
  nonce: string;
  data: string;
  deadline: number
  signature: string
  forwardFeeToken: string
}

export type FetchForwarderGetParams = {
  requestId: string
}

export enum ForwarderGetStatus {
  // 1: Executing, 2: Failed when broadcasting on-chain, 3: Canceled due to timeout, 9: Executed
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
