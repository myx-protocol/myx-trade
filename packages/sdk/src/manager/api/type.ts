export * from './appeal-type.js'
export interface PaginationParams {
    limit?: number
    after?: number
    before?: number
}

export interface GetPositionTransferParams extends PaginationParams {
    chainId?: number
    poolId?: string
    type?: 0 | 1 | 2
}

export interface PositionTransferItem {
    id: number
    chainId: number
    poolId: string
    marketId: string
    positionId: number
    fromAddress: string
    toAddress: string
    baseSymbol: string
    quoteSymbol: string
    direction: number
    userLeverage: number
    size: string
    collateralAmount: string
    entryPrice: string
    status: number
    txHash: string
    txTime: number
}

export interface GetDelistRiskParams {
    chainId: number
    poolId: string
}

export interface DelistRiskInfo {
    volumePeriodStart: number
    volumePeriodEnd: number
    targetVolume: string
    currentVolume: string
    tvlPeriodStart: number
    tvlPeriodEnd: number
    targetTvl: string
    currentTvl: string
}

export interface GetProfitLockParams extends PaginationParams {
    chainId?: number
    poolId?: string
}

export interface ProfitLockItem {
    id: number
    chainId: number
    poolId: string
    account: string
    profitBaseAmount: string
    profitQuoteAmount: string
    usedQuoteAmount: string
    releaseTime: number
    txHash: string
    txTime: number
}