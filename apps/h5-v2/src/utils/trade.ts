import Big, { type BigSource } from 'big.js'

/**
 * 成交额
 */
export const getVolumeQuoteAmount = (volume: BigSource, price: BigSource) => {
  return Big(volume ?? 0)
    .mul(Big(price ?? 0))
    .toString()
}
