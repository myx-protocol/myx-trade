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
    poolId: string
    chainId: number
    market: string
    marginProfit: string
    unlockProfit: string
    nextUnlockTime: number
}