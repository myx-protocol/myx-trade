import { Trans } from '@lingui/react/macro'
import { DirectionEnum } from '@myx-trade/sdk'

export interface SymbolInfoProps {
  direction?: DirectionEnum | null
  leverage?: number | null
  baseSymbol?: string
  quoteSymbol?: string
}
export const SymbolInfo = ({ direction, leverage, baseSymbol, quoteSymbol }: SymbolInfoProps) => {
  let symbol = '--'
  if (baseSymbol || quoteSymbol) {
    symbol = `${baseSymbol}${quoteSymbol}`
  }
  return (
    <div className="text-[12px] leading-[1] font-medium text-white">
      <p>{symbol}</p>
      <div className="mt-[2px] flex items-center">
        {direction == null ? (
          <></>
        ) : direction === DirectionEnum.Long ? (
          <div className="bg-green/10 text-green rounded-[4px] p-[4px] text-[10px]">
            <Trans>Long</Trans>
          </div>
        ) : (
          <div className="bg-danger/10 text-danger rounded-[4px] p-[4px] text-[10px]">
            <Trans>Short</Trans>
          </div>
        )}
        {/* leverage */}
        {leverage !== null && (
          <div className="ml-[4px] rounded-[4px] bg-[#202129] px-[6px] py-[4px] text-[10px] text-[#CED1D9]">
            {leverage ? `${leverage}x` : '--'}
          </div>
        )}
      </div>
    </div>
  )
}
