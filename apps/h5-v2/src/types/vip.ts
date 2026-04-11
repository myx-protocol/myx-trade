export type VipInfoByBackend = {
  account: string
  rebateAddr: string
  vipTier: string
  rebatePct: number
  rebateReferrerPct: number
  deadline: number
  vipExpireTime: number
  signature?: string
  nonce: number
}

export type UserVipInfoContract = {
  0: string
  1: string
  2: number
  3: number
  deadline: number
  nonce: number
}
