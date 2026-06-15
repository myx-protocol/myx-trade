export * from './appeal-type.js'
export interface PaginationParams {
    limit?: number
    after?: number
    before?: number
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