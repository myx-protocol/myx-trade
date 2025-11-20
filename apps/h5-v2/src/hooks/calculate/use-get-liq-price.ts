import { useCallback } from 'react'
import { useGetTradingFee } from './use-get-trading-fee'
import { useGetFundingFee } from './use-get-fundingfee'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'

export const useGetLiqPrice = ({ poolId, chainId }: { poolId: string; chainId: number }) => {
  const { getFundingFee } = useGetFundingFee(poolId, chainId)
  const { getTradingFee } = useGetTradingFee()

  const getLiqPrice = useCallback(
    async ({
      entryPrice,
      collateralAmount,
      size,
      price,
      assetClass,
      fundingRateIndexEntry,
      direction,
      maintainMarginRate,
    }: {
      entryPrice: string
      collateralAmount: string
      size: string
      price: string
      assetClass: number
      fundingRateIndexEntry: string
      direction: Direction
      maintainMarginRate: string
    }) => {
      const tradingFee = await getTradingFee({ size, price, assetClass })
      const fundingFee = getFundingFee(fundingRateIndexEntry, size, direction)
      //  多仓强平价=平均入场价× ( 维护保证金率-(保证金+资金费-平仓手续费)/仓位名义价值 + 1 )
      const netCollateral = parseBigNumber(collateralAmount)
        .plus(parseBigNumber(fundingFee))
        .minus(parseBigNumber(tradingFee))

      const notional = parseBigNumber(size).mul(parseBigNumber(entryPrice))
      const ratio = netCollateral.div(notional)

      // 空仓强平价=平均入场价×(1-维护保证金率+(保证金+资金费-平仓手续费)/仓位名义价值)
      if (direction === Direction.LONG) {
        const result = parseBigNumber(maintainMarginRate)
          .plus(1)
          .minus(ratio)
          .mul(parseBigNumber(entryPrice))

        return result.lt(0) ? 0 : result.toString()
      }

      const result = ratio
        .plus(1)
        .minus(parseBigNumber(maintainMarginRate))
        .mul(parseBigNumber(entryPrice))

      return result.lt(0) ? 0 : result.toString()
    },
    [getFundingFee, getTradingFee],
  )

  return {
    getLiqPrice,
  }
}
