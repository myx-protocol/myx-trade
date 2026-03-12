import { parseBigNumber } from '@/utils/bn'
import { useGetPositionList } from '../position/use-get-position-list'
import { Direction } from '@myx-trade/sdk'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useGetPoolConfig } from '../use-get-pool-config'
import { useGetUserTradingFeeRate } from '../calculate/use-get-trading-fee'
import { type PoolConfig } from '@/store'
import { useGetFundingFee } from '../calculate/use-get-fundingfee'

export const useGetPositionAvailableMargin = (poolId: string, chainId: number) => {
  const { poolConfig } = useGetPoolConfig(poolId, chainId)
  const positionList = useGetPositionList()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[poolId as string]?.price.toString() ?? '0'
  const { getFundingFee } = useGetFundingFee(poolId as string, chainId ?? 0)

  const tradingFeeRate = useGetUserTradingFeeRate(
    chainId,
    poolConfig?.levelConfig?.assetClass ?? 0,
    poolConfig as PoolConfig,
  )

  const longPosition = positionList?.find(
    (position: any) => position.direction === Direction.LONG && position.poolId === poolId,
  )

  const shortPosition = positionList?.find(
    (position: any) => position.direction === Direction.SHORT && position.poolId === poolId,
  )

  let longPositionAvailableMargin = '0'
  let shortPositionAvailableMargin = '0'

  if (longPosition) {
    const pnl =
      parseBigNumber(marketPrice)
        .minus(parseBigNumber(longPosition.entryPrice))
        .mul(parseBigNumber(longPosition.size)) ?? '0'

    const poolMaxLeverage = poolConfig?.levelConfig?.leverage ?? 1
    const positionLeverage = parseBigNumber(longPosition.userLeverage ?? '1').gt(0)
      ? longPosition.userLeverage
      : 1

    const safeLeverage = parseBigNumber(positionLeverage).gt(poolMaxLeverage)
      ? poolMaxLeverage
      : positionLeverage

    //可减少金额 = 仓位保证金 - 持仓数量 * 入场价 / 杠杆 + 资金费 - 交易手续费 + 盈亏
    const originMargin = parseBigNumber(longPosition.entryPrice)
      .mul(parseBigNumber(longPosition.size))
      .div(safeLeverage)

    const tradingFee = parseBigNumber(longPosition.size)
      .mul(parseBigNumber(marketPrice))
      .mul(parseBigNumber(tradingFeeRate))
      .toString()

    const fundingFee = getFundingFee(
      longPosition.fundingRateIndex,
      longPosition.size,
      longPosition.direction,
    )
    longPositionAvailableMargin = parseBigNumber(longPosition.freeAmount)
      .minus(originMargin)
      .plus(parseBigNumber(fundingFee ?? '0'))
      .minus(parseBigNumber(tradingFee ?? '0'))
      .plus(pnl)
      .toString()
  }

  if (shortPosition) {
    const pnl =
      parseBigNumber(shortPosition.entryPrice)
        .minus(parseBigNumber(marketPrice))
        .mul(parseBigNumber(shortPosition.size)) ?? '0'

    const poolMaxLeverage = poolConfig?.levelConfig?.leverage ?? 1
    const positionLeverage = parseBigNumber(shortPosition.userLeverage ?? '1').gt(0)
      ? shortPosition.userLeverage
      : 1
    const safeLeverage = parseBigNumber(positionLeverage).gt(poolMaxLeverage)
      ? poolMaxLeverage
      : positionLeverage

    //可减少金额 = 仓位保证金 - 持仓数量 * 入场价 / 杠杆 + 资金费 - 交易手续费 + 盈亏
    const originMargin = parseBigNumber(shortPosition.entryPrice)
      .mul(parseBigNumber(shortPosition.size))
      .div(safeLeverage)

    const tradingFee = parseBigNumber(shortPosition.size)
      .mul(parseBigNumber(marketPrice))
      .mul(parseBigNumber(tradingFeeRate))
      .toString()

    const fundingFee = getFundingFee(
      shortPosition.fundingRateIndex,
      shortPosition.size,
      shortPosition.direction,
    )

    shortPositionAvailableMargin = parseBigNumber(shortPosition.freeAmount)
      .minus(originMargin)
      .plus(parseBigNumber(fundingFee ?? '0'))
      .minus(parseBigNumber(tradingFee ?? '0'))
      .plus(pnl)
      .toString()
  }

  return {
    longPositionAvailableMargin,
    shortPositionAvailableMargin,
  }
}
