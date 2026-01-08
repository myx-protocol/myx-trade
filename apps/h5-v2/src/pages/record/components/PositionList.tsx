import { PositionItem } from '@/components/Record/Items/Position'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import useGlobalStore from '@/store/globalStore'
import { Empty } from '@/components/Empty'

export const PositionList = () => {
  const positionList = useGetPositionList(true)
  const { tickerData } = useMarketStore()
  const { poolList } = useGlobalStore()

  if (!positionList.length) {
    return (
      <div>
        <Empty />
      </div>
    )
  }

  return (
    <>
      {positionList.map((position: any, index: number) => (
        <PositionItem
          key={index}
          position={position}
          marketPrice={tickerData[position.poolId]?.price ?? '0'}
          pool={poolList.find((pool: any) => pool.poolId === position.poolId)}
        />
      ))}
    </>
  )
}
