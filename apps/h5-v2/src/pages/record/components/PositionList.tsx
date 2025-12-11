import { PositionItem } from '@/components/Record/Items/Position'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'

export const PositionList = () => {
  const positionList = useGetPositionList()
  const { tickerData } = useMarketStore()
  const { poolList } = useGetPoolList()

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
