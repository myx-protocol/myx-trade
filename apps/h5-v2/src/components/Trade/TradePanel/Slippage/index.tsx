import { Trans } from '@lingui/react/macro'
import EditSimply from '@/components/Icon/set/EditSimply'
import { SlippageDialog } from '../../Dialog/Slippage'
import { useEffect, useState } from 'react'
import { PositionActionEnum } from '../../type'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { useTradePageStore } from '../../store/TradePageStore'
import { tradePubSub } from '@/utils/pubsub'

export const Slippage = ({
  defaultSlippage,
  direction,
}: {
  defaultSlippage: number
  direction: PositionActionEnum
}) => {
  const [open, setOpen] = useState(false)
  const { symbolInfo } = useTradePageStore()
  const [slippageDisplay, setSlippageDisplay] = useState<number>(0)

  useEffect(() => {
    const type =
      direction === PositionActionEnum.OPEN ? SlippageTypeEnum.OPEN : SlippageTypeEnum.CLOSE
    const updateSlippage = () => {
      const slippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type,
      })
      setSlippageDisplay(slippage ?? 0)
    }

    updateSlippage()
    tradePubSub.on('trade:slippage:change', updateSlippage)
    return () => {
      tradePubSub.off('trade:slippage:change', updateSlippage)
    }
  }, [direction, symbolInfo])

  return (
    <>
      <div
        className="ml-[4px] rounded-[6px] bg-[#18191F] px-[10px] py-[8px] text-[12px] font-medium text-[#848E9C]"
        onClick={() => setOpen(true)}
      >
        <p className="text-[#CED1D9]">{slippageDisplay ? slippageDisplay * 100 : '--'}%</p>
      </div>
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
