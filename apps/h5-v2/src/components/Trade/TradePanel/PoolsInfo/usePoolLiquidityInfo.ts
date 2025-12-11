import { useTradePageStore } from '../../store/TradePageStore'
import { usePoolInfo } from '../../hooks/usePoolInfo'
import { availableLiquiditySizeWad } from '@/utils/liquidity'
import { Big } from 'big.js'
import { parseUnits, formatUnits } from 'ethers'
import useSWR from 'swr'
import { useMarketStore } from '../../store/MarketStore'

const BASE_RESERVE_RATIO = '100'
const QUOTE_RESERVE_RATIO = '100'
export const usePoolLiquidityInfo = () => {
  const { symbolInfo } = useTradePageStore()
  const { data: poolInfo } = usePoolInfo({
    poolId: symbolInfo?.poolId,
    chainId: symbolInfo?.chainId,
  })

  const { data, isLoading } = useSWR(
    symbolInfo?.poolId && symbolInfo?.chainId && poolInfo
      ? ['availableLiquiditySizeWad', symbolInfo?.poolId, symbolInfo?.chainId]
      : null,
    async () => {
      if (!symbolInfo?.poolId || !symbolInfo?.chainId || !poolInfo) return null
      // get the base reserve ratio
      const baseTokenDecimals = symbolInfo.baseDecimals
      const quoteTokenDecimals = symbolInfo.quoteDecimals
      const baseReserveRatio = symbolInfo.baseReserveRatio
        ? Big(symbolInfo.baseReserveRatio).toString()
        : BASE_RESERVE_RATIO
      // get the quote reserve ratio
      const quoteReserveRatio = symbolInfo.quoteReserveRatio
        ? Big(symbolInfo.quoteReserveRatio).toString()
        : QUOTE_RESERVE_RATIO
      // get the base total amount wad
      const baseTotalAmountWad = Big(
        parseUnits(
          formatUnits(poolInfo?.reserveInfo.baseTotalAmount || 0n, baseTokenDecimals),
          18,
        ).toString(),
      ).toFixed(0, Big.roundDown)
      // get the quote total amount wad
      const quoteTotalAmountWad = Big(
        parseUnits(
          formatUnits(poolInfo?.reserveInfo.quoteTotalAmount || 0n, quoteTokenDecimals),
          18,
        ).toString(),
      ).toFixed(0, Big.roundDown)
      // get the base reserved amount wad
      const baseReservedAmountWad = Big(
        parseUnits(
          formatUnits(poolInfo?.reserveInfo.baseReservedAmount || 0n, baseTokenDecimals),
          18,
        ).toString(),
      ).toFixed(0, Big.roundDown)
      // get the quote reserved amount wad
      const quoteReservedAmountWad = Big(
        parseUnits(
          formatUnits(poolInfo?.reserveInfo.quoteReservedAmount || 0n, quoteTokenDecimals),
          18,
        ).toString(),
      ).toFixed(0, Big.roundDown)
      // get the price from the market store
      const price = useMarketStore.getState().tickerData[symbolInfo?.poolId || '']?.price

      // if the price is not found, return null
      if (!price) return null
      // convert the price to the execute price
      const executePrice = parseUnits(price.toString(), 30).toString()
      // convert the tracker to the tracker wad
      const trackerWad = Big(
        parseUnits(
          formatUnits(poolInfo?.ioTracker.tracker || 0n, baseTokenDecimals),
          18,
        ).toString(),
      ).toFixed(0, Big.roundDown)
      // check if the tracker is long biased
      const isLongBiased = Big(trackerWad).gt(0)

      // calculate the buy size value
      const buySizeValue = availableLiquiditySizeWad({
        baseTotalAmountWad,
        quoteTotalAmountWad,
        baseReservedAmountWad,
        quoteReservedAmountWad,
        isLongBiased,
        baseReserveRatio,
        quoteReserveRatio,
        trackerWad,
        isBuy: true,
        executePrice,
      })
      // calculate the sell size value
      const sellSizeValue = availableLiquiditySizeWad({
        baseTotalAmountWad,
        quoteTotalAmountWad,
        baseReservedAmountWad,
        quoteReservedAmountWad,
        isLongBiased,
        baseReserveRatio,
        quoteReserveRatio,
        trackerWad,
        isBuy: false,
        executePrice,
      })

      const longSize = Big((poolInfo?.ioTracker.longSize || 0n).toString()).toFixed(
        0,
        Big.roundDown,
      )
      const shortSize = Big((poolInfo?.ioTracker.shortSize || 0n).toString()).toFixed(
        0,
        Big.roundDown,
      )

      const longSizeFormatted = formatUnits(longSize, baseTokenDecimals)
      const shortSizeFormatted = formatUnits(shortSize, baseTokenDecimals)

      // base token amount formatted
      const buySizeValueFormatted = formatUnits(buySizeValue, 18)
      // quote token amount formatted
      const sellSizeValueFormatted = formatUnits(sellSizeValue, 18)

      // buy size value formatted quote
      const buySizeValueFormatedQuote = Big(buySizeValueFormatted).mul(price).toString()
      // sell size value formatted quote
      const sellSizeValueFormatedQuote = Big(sellSizeValueFormatted).mul(price).toString()

      // long size value formatted quote
      const longSizeValueFormatedQuote = Big(longSizeFormatted).mul(price).toString()

      // short size value formatted quote
      const shortSizeValueFormatedQuote = Big(shortSizeFormatted).mul(price).toString()

      return {
        buySizeValue,
        sellSizeValue,
        buySizeValueFormatted,
        sellSizeValueFormatted,
        buySizeValueFormatedQuote,
        sellSizeValueFormatedQuote,
        longSize,
        shortSize,
        longSizeFormatted,
        shortSizeFormatted,
        longSizeValueFormatedQuote,
        shortSizeValueFormatedQuote,
      }
    },
    {
      refreshInterval: 3000,
      keepPreviousData: true, // 关键：保留之前的数据，避免闪烁
    },
  )

  return { data, isLoading }
}
