import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { OrderStatusEnum } from '@myx-trade/sdk'
import { useMemo } from 'react'

interface OrderStatusProps {
  orderStatus?: OrderStatusEnum
  cancelReason?: string
}
export const OrderStatus = ({ orderStatus, cancelReason }: OrderStatusProps) => {
  const orderError = useMemo(() => {
    if (cancelReason) {
      return cancelReason
    }
    return null
  }, [cancelReason])
  switch (orderStatus) {
    case OrderStatusEnum.Successful:
      return <Trans>Successful</Trans>
    case OrderStatusEnum.Cancelled:
      return (
        <Tooltips title={orderError ?? t`Order canceled`}>
          <p className="text-tooltip w-fit">
            <Trans>Canceled</Trans>
          </p>
        </Tooltips>
      )
    case OrderStatusEnum.Expired:
      return <Trans>Expired</Trans>
    default:
      return '--'
  }
}
