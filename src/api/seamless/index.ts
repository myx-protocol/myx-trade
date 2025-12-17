import { ApiResponse, BaseResponse } from "../type";
import { http } from "../request";
import { getForwardUrlByEnv } from "../index";
import { addQueryParams } from "../utils";

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

export const forwarderTxApi = async (params: ForwarderTxParams, chainId: number, isProd = true) => {
  return http.post<ApiResponse<any>>(
    `${getForwardUrlByEnv(isProd)}/forwarder/tx-v2`,
    params,
    {
      headers: {
        'myx-chain-id': chainId.toString(),
      },
    },
  );
};

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

export const fetchForwarderGetApi = async (params: FetchForwarderGetParams, isProd = true) => {
  const rs: FetchForwarderGetResponse = await http.get(
    `${getForwardUrlByEnv(isProd)}/forwarder/get${addQueryParams(params)}`,
  )

  return rs
}