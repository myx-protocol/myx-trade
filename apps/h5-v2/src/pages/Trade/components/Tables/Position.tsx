import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { PositionItem as RecordPositionItem } from '@/components/Record/Items/Position'
import useGlobalStore from '@/store/globalStore'

export const Position = () => {
  const { tickerData } = useMarketStore()
  const positionList = useGetPositionList(true)
  const { poolList } = useGlobalStore()

  return (
    <>
      {positionList.map((item: any, index: number) => (
        <RecordPositionItem
          key={index}
          position={item}
          marketPrice={tickerData[item.poolId]?.price ?? '0'}
          pool={poolList.find((pool: any) => pool.poolId === item.poolId)}
        />
      ))}
    </>
  )
}
