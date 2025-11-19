import type { ReactNode } from 'react'

import { useTradePanelStore } from '../store'
import { Trans } from '@lingui/react/macro'
import { OrderType as OrderTypeEnum } from '@myx-trade/sdk'

interface OrderTypeButtonProps {
  value: OrderTypeEnum
  label: ReactNode
}

const OrderTypeButton = ({ value, label }: OrderTypeButtonProps) => {
  const { orderType, setOrderType } = useTradePanelStore()
  const active = orderType === value

  return (
    <div
      className={`rounded-[6px] ${active ? 'bg-[#18191F]' : ''} px-[10px] py-[8px] text-[12px] leading-[1] font-medium ${active ? 'text-[#FFFFFF]' : 'text-[#848E9C]'}`}
      onClick={() => setOrderType(value)}
      role="button"
    >
      {label}
    </div>
  )
}

export const OrderType = () => {
  return (
    <div className="mt-[8px] flex gap-[4px]">
      <OrderTypeButton value={OrderTypeEnum.MARKET} label={<Trans>Market</Trans>} />
      <OrderTypeButton value={OrderTypeEnum.LIMIT} label={<Trans>Limit</Trans>} />
    </div>
  )
}
