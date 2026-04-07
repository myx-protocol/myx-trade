import { useCallback } from 'react'
import { useGetTradingFee, useGetTradingFeeInfo } from './use-get-trading-fee'
import { useGetFundingFee } from './use-get-fundingfee'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import useSWR from 'swr'

export const useGetLiqPrice = ({ poolId, chainId }: { poolId: string; chainId: number }) => {
  const { getFundingFee } = useGetFundingFee(poolId)
  const { getTradingFee } = useGetTradingFee(chainId)
  const { getNetworkFee } = useGetNetworkFee({ poolId, chainId })
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
      const networkFee = await getNetworkFee()

      // C
      const netCollateral = parseBigNumber(collateralAmount)
        .plus(parseBigNumber(fundingFee))
        .minus(parseBigNumber(networkFee))
        .minus(parseBigNumber(tradingFee))

      const notional = parseBigNumber(size).mul(parseBigNumber(entryPrice))
      // const safeNotionalPrice = notional.eq(0) ? parseBigNumber(1) : notional
      // const ratio = netCollateral.div(safeNotionalPrice)

      //  longLiqPrice = (entryPrice * size - (collateralAmount + fundingFee - tradingFee - networkFee)) / (size * (1 - maintainMarginRate))
      if (direction === Direction.LONG) {
        const result = notional
          .minus(netCollateral)
          .div(
            parseBigNumber(size).mul(parseBigNumber(1).minus(parseBigNumber(maintainMarginRate))),
          )

        return result.lt(0) ? 0 : result.toString()
      }

      //  shortLiqPrice = (netCollateral + size * entryPrice) / (size * (1 + maintainMarginRate))
      const result = netCollateral
        .plus(notional)
        .div(parseBigNumber(size).mul(parseBigNumber(1).plus(parseBigNumber(maintainMarginRate))))

      return result.lt(0) ? 0 : result.toString()
    },
    [getFundingFee, getTradingFee],
  )

  return {
    getLiqPrice,
  }
}

export const useGetNetworkFee = ({ poolId, chainId }: { poolId: string; chainId: number }) => {
  const { client } = useMyxSdkClient(chainId)
  const { poolList } = useGetPoolList()
  const getNetworkFee = useCallback(async () => {
    const pool = poolList.find((item: any) => item.poolId === poolId)
    const networkFeeString = await client?.utils.getNetworkFee(pool.marketId, chainId)
    return parseBigNumber(networkFeeString).div(10 ** (pool.quoteDecimals ?? 1))
  }, [client, poolId, chainId])

  return { getNetworkFee }
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
  const { getFundingFee } = useGetFundingFee(poolId)
  const tradingFee = useGetTradingFeeInfo({ size, price, assetClass, chainId })
  const fundingFee = getFundingFee(fundingRateIndexEntry, size, direction)
  const { getNetworkFee } = useGetNetworkFee({ poolId, chainId })

  const { data: networkFee } = useSWR(
    { key: 'getNetworkFee', poolId, chainId },
    async () => await getNetworkFee(),
  )

  const netCollateral = parseBigNumber(collateralAmount)
    .plus(parseBigNumber(fundingFee))
    .minus(parseBigNumber(tradingFee))
    .minus(parseBigNumber(networkFee ?? 0))

  const notional = parseBigNumber(size).mul(parseBigNumber(entryPrice))
  const safeNotionalPrice = notional.eq(0) ? parseBigNumber(1) : notional
  const ratio = netCollateral.div(safeNotionalPrice)

  //  多仓强平价=平均入场价× (维护保证金率-(保证金+资金费-平仓手续费)/仓位名义价值 + 1)
  // todo 保证金+资金费-平仓手续费-执行费

  if (direction === Direction.LONG) {
    const result = notional
      .minus(netCollateral)
      .div(parseBigNumber(size).mul(parseBigNumber(1).minus(parseBigNumber(maintainMarginRate))))

    const liqPrice = result.lt(0) ? '0' : result.toString()
    return liqPrice
  }

  // 空仓强平价=平均入场价×(1-维护保证金率+(保证金+资金费-平仓手续费)/仓位名义价值)
  // todo 保证金+资金费-平仓手续费-执行费
  const result = netCollateral
    .plus(notional)
    .div(parseBigNumber(size).mul(parseBigNumber(1).plus(parseBigNumber(maintainMarginRate))))

  const liqPrice = result.lt(0) ? '0' : result.toString()
  return liqPrice
}
