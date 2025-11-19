import type { BaseResponse } from '@/request/type.ts'

export enum OracleType {
  Chainlink = 1,
  Pyth,
}
export type PriceType = {
  oracleId: number
  price: string
  vaa: string
  publishTime: number
  oracleType?: OracleType
  nativeFee?: number | string
  poolId: string
}

export interface PriceResponse extends BaseResponse {
  data: PriceType[]
}
