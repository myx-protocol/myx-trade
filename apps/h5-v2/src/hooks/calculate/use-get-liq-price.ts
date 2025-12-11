import { useCallback } from 'react'
import { useGetTradingFee, useGetTradingFeeInfo } from './use-get-trading-fee'
import { useGetFundingFee } from './use-get-fundingfee'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { displayAmount } from '@/utils/number'

export const useGetLiqPrice = ({ poolId, chainId }: { poolId: string; chainId: number }) => {
  const { getFundingFee } = useGetFundingFee(poolId, chainId)
  const { getTradingFee } = useGetTradingFee(chainId)

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
      needFundingFee = true,
    }: {
      entryPrice: string
      collateralAmount: string
      size: string
      price: string
      assetClass: number
      fundingRateIndexEntry: string
      direction: Direction
      maintainMarginRate: string
      needFundingFee?: boolean
    }) => {
      const tradingFee = await getTradingFee({ size, price, assetClass })
      const fundingFee = needFundingFee
        ? getFundingFee(fundingRateIndexEntry, size, direction)
        : '0'

      const netCollateral = parseBigNumber(collateralAmount)
        .plus(parseBigNumber(fundingFee))
        .minus(parseBigNumber(tradingFee))

      const notional = parseBigNumber(size).mul(parseBigNumber(entryPrice))
      const ratio = netCollateral.div(notional)

      //  多仓强平价=平均入场价× (维护保证金率-(保证金+资金费-平仓手续费)/仓位名义价值 + 1)
      if (direction === Direction.LONG) {
        const result = parseBigNumber(maintainMarginRate)
          .plus(1)
          .minus(ratio)
          .mul(parseBigNumber(entryPrice))

        return result.lt(0) ? 0 : result.toString()
      }

      // 空仓强平价=平均入场价×(1-维护保证金率+(保证金+资金费-平仓手续费)/仓位名义价值)
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

export const useCalculateLiqPrice = ({
  poolId,
  chainId,
  size,
  price,
  assetClass,
  entryPrice,
  collateralAmount,
  fundingRateIndexEntry,
  direction,
  maintainMarginRate,
}: {
  poolId: string
  chainId: number
  size: string
  price: string
  assetClass: number
  entryPrice: string
  collateralAmount: string
  fundingRateIndexEntry: string
  direction: Direction
  maintainMarginRate: string
}) => {
  const { getFundingFee } = useGetFundingFee(poolId, chainId)
  const tradingFee = useGetTradingFeeInfo({ size, price, assetClass, chainId })
  const fundingFee = getFundingFee(fundingRateIndexEntry, size, direction)

  const netCollateral = parseBigNumber(collateralAmount)
    .plus(parseBigNumber(fundingFee))
    .minus(parseBigNumber(tradingFee))

  const notional = parseBigNumber(size).mul(parseBigNumber(entryPrice))
  const ratio = netCollateral.div(notional)

  //  多仓强平价=平均入场价× (维护保证金率-(保证金+资金费-平仓手续费)/仓位名义价值 + 1)

  if (direction === Direction.LONG) {
    const result = parseBigNumber(maintainMarginRate)
      .plus(1)
      .minus(ratio)
      .mul(parseBigNumber(entryPrice))

    const liqPrice = result.lt(0) ? '0' : result.toString()
    return liqPrice
  }

  // 空仓强平价=平均入场价×(1-维护保证金率+(保证金+资金费-平仓手续费)/仓位名义价值)
  const result = ratio
    .plus(1)
    .minus(parseBigNumber(maintainMarginRate))
    .mul(parseBigNumber(entryPrice))

  const liqPrice = result.lt(0) ? '0' : result.toString()
  return liqPrice
}
