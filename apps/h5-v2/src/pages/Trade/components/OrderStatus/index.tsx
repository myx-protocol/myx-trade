import { Tooltips } from '@/components/UI/Tooltips'
import { MYXSDKErrorMapping } from '@/config/error/MYX_SDK_ERRORS'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { OrderStatusEnum } from '@myx-trade/sdk'
import { useMemo } from 'react'

const OrderStatusMap: Record<string, () => string> = {
  'EXPIRED ORDER': () => t`无效订单，被Keeper清理`,
  'USER CANCELLED': () => t`用户已取消`,
  'Position closed': () => t`仓位已平仓`,
  'No execute size': () => t`无可执行数量`,
  'Slippage exceeded': () => t`滑点超限`,
  'Not position owner': () => t`非仓位持有者`,
  'Order expired': () => t`订单执行超时失效`,
  'Order size out of range': () => t`订单数量超限`,
  'Invalid Order': () => t`无效订单`,
}

interface OrderStatusProps {
  orderStatus?: OrderStatusEnum
  cancelReason?: string
}
export const OrderStatus = ({ orderStatus, cancelReason }: OrderStatusProps) => {
  const orderError = useMemo(() => {
    if (cancelReason) {
      if (OrderStatusMap[cancelReason]) {
        return OrderStatusMap[cancelReason]()
      }

      const hashPrefix = cancelReason.slice(0, 10)
      if (MYXSDKErrorMapping[hashPrefix]) {
        return MYXSDKErrorMapping[hashPrefix]
      }

      return cancelReason
    }
    return null
  }, [cancelReason])
  switch (orderStatus) {
    case OrderStatusEnum.Successful:
      return <Trans>Successful</Trans>
    case OrderStatusEnum.PartialFilled:
      return <Trans>Partially filled</Trans>
    case OrderStatusEnum.Cancelled:
      return (
        <Tooltips title={(orderError as string) ?? t`Order canceled`}>
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
