import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useMemo } from 'react'
import { useGetPositionList } from '../position/use-get-position-list'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'

export const useGetCloseAvailable = () => {
  const positionList = useGetPositionList()
  const { symbolInfo } = useTradePageStore()
  const { price } = useTradePanelStore()

  const maxCloseLongAmount = useMemo(() => {
    const list =
      positionList?.filter(
        (position: any) =>
          position.poolId === symbolInfo?.poolId && position.direction === Direction.LONG,
      ) ?? []

    const size = list?.reduce(
      (acc: Big, position: any) => acc.plus(parseBigNumber(position.size)),
      parseBigNumber(0),
    )

    return {
      quoteAmount: size?.mul(parseBigNumber(price ?? '0')).toString(),
      baseAmount: size?.toString() ?? '0',
    }
  }, [positionList, symbolInfo, price])

  const maxCloseShortAmount = useMemo(() => {
    const list =
      positionList?.filter(
        (position: any) =>
          position.poolId === symbolInfo?.poolId && position.direction === Direction.SHORT,
      ) ?? []

    const size = list?.reduce(
      (acc: Big, position: any) => acc.plus(parseBigNumber(position.size)),
      parseBigNumber(0),
    )
    return {
      quoteAmount: size?.mul(parseBigNumber(price ?? '0')).toString() ?? '0',
      baseAmount: size?.toString() ?? '0',
    }
  }, [positionList, symbolInfo, price])

  return {
    maxCloseLong: {
      quoteAmount: maxCloseLongAmount.quoteAmount ?? '0',
      baseAmount: maxCloseLongAmount.baseAmount ?? '0',
    },
    maxCloseShort: {
      quoteAmount: maxCloseShortAmount.quoteAmount ?? '0',
      baseAmount: maxCloseShortAmount.baseAmount ?? '0',
    },
  }
}
