import { parseBigNumber } from '@/utils/bn'

/**
 * 与 use-submit-order 中开仓 totalNetworkFee 一致：每笔下单消耗一笔 network fee，
 * 开仓 1 笔，若开启 TP/SL 且数值非零则各再加一笔。
 */
export function getOpenOrderNetworkFeeReserveQuote(
  networkFeeHuman: string | undefined,
  tpSlOpen: boolean,
  tpValue: string,
  slValue: string,
): string {
  const unit = parseBigNumber(networkFeeHuman ?? 0)
  if (unit.lte(0)) return '0'

  let count = 1
  if (tpSlOpen && tpValue && !parseBigNumber(tpValue).eq(0)) count += 1
  if (tpSlOpen && slValue && !parseBigNumber(slValue).eq(0)) count += 1

  return unit.mul(count).toString()
}

export function subtractReserveFromAvailable(availableHuman: string, reserveHuman: string): string {
  const result = parseBigNumber(availableHuman).minus(parseBigNumber(reserveHuman))
  return result.gt(0) ? result.toString() : '0'
}
