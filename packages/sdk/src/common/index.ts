export * from './approve.js'
export * from './allowance.js'
export * from './balanceOf.js'
export * from './tradingGas.js'
export * from './tokenInfo.js'

import { formatUnits as _formatUnits, parseUnits  } from "viem";


export const formatUnits = (value: undefined | null | bigint,  decimals: number) => {
  if (value === undefined || value === null ) {
    return value
  }
  return _formatUnits(value, decimals)
}

export { parseUnits }
