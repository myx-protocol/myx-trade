import { Trans } from '@lingui/react/macro'
import { OrderStatusEnum } from '@myx-trade/sdk'

interface OrderStatusProps {
  orderStatus?: OrderStatusEnum
}
export const OrderStatus = ({ orderStatus }: OrderStatusProps) => {
  switch (orderStatus) {
    case OrderStatusEnum.Successful:
      return <Trans>Successful</Trans>
    case OrderStatusEnum.Cancelled:
      return <Trans>Canceled</Trans>
    case OrderStatusEnum.Expired:
      return <Trans>Expired</Trans>
    default:
      return '--'
  }
}
