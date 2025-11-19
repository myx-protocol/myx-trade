import { Trans } from '@lingui/react/macro'
import { OperationEnum, OrderTypeEnum } from '@myx-trade/sdk'

interface OrderTypeProps {
  orderType?: OrderTypeEnum
  operation?: OperationEnum
}

export const OrderType = ({ orderType, operation }: OrderTypeProps) => {
  // increase
  if (operation === OperationEnum.Increase) {
    switch (orderType) {
      case OrderTypeEnum.Market:
        return <Trans>市价开仓</Trans>
      case OrderTypeEnum.Limit:
        return <Trans>限价开仓</Trans>
      case OrderTypeEnum.Stop:
        return <Trans>止盈止损</Trans>
      default:
        return '--'
    }
  } else {
    // decrease
    switch (orderType) {
      case OrderTypeEnum.Market:
        return <Trans>市价平仓</Trans>
      case OrderTypeEnum.Limit:
        return <Trans>限价平仓</Trans>
      case OrderTypeEnum.Stop:
        return <Trans>止盈止损</Trans>
      default:
        return '--'
    }
  }
}
