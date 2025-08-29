export interface ObjectType<T> {
  [key: string]: T;
}
export type Address = `0x${string}`;
export type NetWorkFee = {
  paymentType: number;
  volScale: number;
};
export enum ErrorCode {
  SUCCESS = 9200,
  SUCCESS_ORIGIN = 0,
  IDENTITY_VERIFICATION_FAILED = 9401,
  PERMISSION_DENIED = 9403,
  NOT_EXIST = 9404,
  REQUEST_LIMIT = 9429,
  SERVICE_ERROR = 9500,
  MISS_REQUESTED_PARAMETER = 9900,
  INVALID_PARAMETER = 9901,
  NETWORK_ERROR = "ERR_NETWORK",
}
export interface BaseResponse {
  code: ErrorCode;
  msg: string | null;
}

export type DashboardType = {
  lpAsset: string;
  cumTradeAmount: string;
  cumEarnings: string;
  accountCount: number;
  positionAmount: string;
  positionAmountRate: string | number;
  accountCountRate: string | number;
  tradeAmountRate: number | string;
  lpAssetRate: string | number;
  earningsRate: string | number;
};

export interface StatDashBoardResponse extends BaseResponse {
  data: DashboardType;
}
