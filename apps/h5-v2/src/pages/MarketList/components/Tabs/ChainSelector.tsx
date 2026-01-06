import clsx from 'clsx'
import { useMemo, useState } from 'react'
import ChainAllIcon from '@/components/Icon/set/ChainAll'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo } from '@/config/chainInfo'
import { useMarketPageStore } from '../../store'

export const ChainSelector = () => {
  // const [selectedChain, setSelectedChain] = useState<'all' | number>('all')
  const { chainId, setChainId } = useMarketPageStore()
  const chainInfoList = useMemo(() => {
    return getSupportedChainIdsByEnv().map((chainId) => ({
      ...getChainInfo(chainId),
      chainId,
    }))
  }, [])
  return (
    <div className="mt-[12px] px-[12px]">
      <div className="flex w-full items-center justify-start gap-[12px] overflow-x-auto">
        <div
          className={clsx(
            'flex min-w-fit items-center gap-[2px] rounded-[6px] py-[6px] pr-[10px] pl-[8px]',
            {
              'bg-[#202129] text-white': chainId === 0,
              'text-[#6D7180]': chainId !== 0,
            },
          )}
          onClick={() => setChainId(0)}
        >
          <ChainAllIcon size={14} />
          <p className="text-[12px]">All</p>
        </div>

        {chainInfoList.map((chainInfo) => (
          <div
            key={chainInfo.chainId}
            className={clsx(
              'flex min-w-fit items-center gap-[2px] rounded-[6px] py-[6px] pr-[10px] pl-[8px]',
              {
                'bg-[#202129] text-white': chainId === chainInfo.chainId,
                'text-[#6D7180]': chainId !== chainInfo.chainId,
              },
            )}
            onClick={() => setChainId(chainInfo.chainId)}
          >
            <p className="text-[12px]">{chainInfo.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
