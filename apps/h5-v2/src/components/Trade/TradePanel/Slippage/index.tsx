import { SlippageDialog } from '../../Dialog/Slippage'
import { useEffect, useState } from 'react'
import { PositionActionEnum } from '../../type'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import useGlobalStore from '@/store/globalStore'
import { tradePubSub } from '@/utils/pubsub'
import type { MarketDetailResponse } from '@myx-trade/sdk'
import { formatNumber } from '@/utils/number'

export const Slippage = ({
  defaultSlippage,
  direction,
  symbol,
  simple = false,
}: {
  symbol?: MarketDetailResponse
  defaultSlippage: number
  direction: PositionActionEnum
  color?: string
  simple?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const { symbolInfo } = useGlobalStore()
  const [slippageDisplay, setSlippageDisplay] = useState<number>(defaultSlippage * 100)

  useEffect(() => {
    const type =
      direction === PositionActionEnum.OPEN ? SlippageTypeEnum.OPEN : SlippageTypeEnum.CLOSE
    const updateSlippage = () => {
      const _symbolInfo = symbol ?? symbolInfo
      const slippage = getSlippage({
        chainId: _symbolInfo?.chainId ?? 0,
        poolId: _symbolInfo?.poolId ?? '',
        type,
      })

      setSlippageDisplay(slippage ?? 0)
    }

    updateSlippage()
    tradePubSub.on('trade:slippage:change', updateSlippage)
    return () => {
      tradePubSub.off('trade:slippage:change', updateSlippage)
    }
  }, [direction, symbolInfo, symbol])

  return (
    <>
      {!simple ? (
        <div
          className="rounded-[6px] bg-[#18191F] px-[10px] py-[8px] text-[12px] font-medium text-[#CED1D9]"
          onClick={() => setOpen(true)}
        >
          <p>
            {slippageDisplay
              ? `${formatNumber(slippageDisplay * 100, { decimals: 4 })}%`
              : `${formatNumber(defaultSlippage * 100, { decimals: 4 })}%`}
          </p>
        </div>
      ) : (
        <div onClick={() => setOpen(true)}>
          <p>
            {slippageDisplay
              ? `${formatNumber(slippageDisplay * 100, { decimals: 4 })}%`
              : `${formatNumber(defaultSlippage * 100, { decimals: 4 })}%`}
          </p>
        </div>
      )}
      <SlippageDialog
        defaultSlippage={defaultSlippage}
        open={open}
        onClose={() => setOpen(false)}
        onChange={() => {
          const type =
            direction === PositionActionEnum.OPEN ? SlippageTypeEnum.OPEN : SlippageTypeEnum.CLOSE
          const slippage = getSlippage({
            chainId: symbolInfo?.chainId ?? 0,
            poolId: symbolInfo?.poolId ?? '',
            type,
          })
          setSlippageDisplay(slippage ?? 0)
          setOpen(false)
        }}
      />
    </>
  )
}
