import { SortDown, ArrowLeftLong, Star } from '@/components/Icon'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { truncateString } from '@/utils/string'
import { useNavigate } from 'react-router-dom'
import { usePriceStore } from '../store'
import { useBaseTokenInfo } from '@/components/Trade/hooks/useBaseTokenInfo'

export const Header = () => {
  const navigate = useNavigate()
  const { symbolInfo } = usePriceStore()
  const { data: baseTokenInfo } = useBaseTokenInfo({
    chainId: symbolInfo?.chainId,
    poolId: symbolInfo?.poolId,
  })
  return (
    <div className="bg-deep sticky top-0 z-20 flex h-auto shrink-0 items-center justify-between px-[16px] pt-[16px] pb-[12px]">
      <div className="flex items-center gap-[12px] text-white">
        <span
          role="button"
          className="flex"
          onClick={() => {
            navigate(-1)
          }}
        >
          <ArrowLeftLong size={20} />
        </span>

        <div className="flex items-center gap-[4px]" role="button">
          <p className="text-[16px] font-bold">
            {`${symbolInfo?.baseSymbol || '--'}${symbolInfo?.quoteSymbol || ''}`}
          </p>
          <span>
            <SortDown size={8} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        <span role="button" className="flex">
          <Star size={18} />
        </span>
        <div className="flex items-center">
          <CoinIcon size={20} icon={baseTokenInfo?.tokenIcon} />
          <div className="ml-[4px] flex items-center gap-[2px]" role="button">
            <p className="text-[14px] font-medium">
              {truncateString(symbolInfo?.baseToken || '', 2, 4, '..')}
            </p>
            <span>
              <SortDown size={8} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
