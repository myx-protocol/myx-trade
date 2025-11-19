import { useTradePanelStore } from '../store'
import { PositionActionEnum } from '../../type'
import { OpenPosition } from './Open'
import { ClosePosition } from './Close'

export const PlaceOrder = () => {
  const { positionAction } = useTradePanelStore()

  //   open
  if (positionAction === PositionActionEnum.OPEN) {
    return <OpenPosition />
  }
  //   close
  return <ClosePosition />
}
