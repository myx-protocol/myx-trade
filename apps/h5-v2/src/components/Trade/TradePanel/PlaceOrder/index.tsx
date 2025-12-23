import { useTradePanelStore } from '../store'
import { PositionActionEnum } from '../../type'
import { OpenPosition } from './Open'
import { ClosePosition } from './Close'

interface PlaceOrderProps {
  showOrderSize?: boolean
}

export const PlaceOrder = ({ showOrderSize = true }: PlaceOrderProps) => {
  const { positionAction } = useTradePanelStore()

  //   open
  if (positionAction === PositionActionEnum.OPEN) {
    return <OpenPosition showOrderSize={showOrderSize} />
  }
  //   close
  return <ClosePosition showOrderSize={showOrderSize} />
}
