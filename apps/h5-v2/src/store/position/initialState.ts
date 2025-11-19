export interface PositionState {
  hideOthersSymbols: boolean
  selectChainId: string
  closeAllPositionDialogOpen: boolean
}

export const positionState: PositionState = {
  hideOthersSymbols: false,
  selectChainId: '0',
  closeAllPositionDialogOpen: false,
}
