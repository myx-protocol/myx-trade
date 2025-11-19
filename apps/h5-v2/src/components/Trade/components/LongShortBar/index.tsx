import Big from 'big.js'

interface LongShortBarProps {
  long: number
  short: number
}

export const LongShortBar = ({ long, short }: LongShortBarProps) => {
  const total = Big(long).plus(short)
  let longPrecent = '50'
  let shortPrecent = '50'
  if (Big(total).gt(0)) {
    longPrecent = Big(long).div(total).mul(100).toFixed(2)
    shortPrecent = Big(100).sub(longPrecent).toNumber().toString()
  }
  const hiddenSplitLine = Big(long).eq(0) || Big(short).eq(0)
  return (
    <div
      className="relative h-[3px] w-full overflow-hidden bg-[#202129]"
      style={
        {
          '--long-percentage': `${longPrecent}%`,
          '--short-percentage': `${shortPrecent}%`,
        } as React.CSSProperties
      }
    >
      {/* long bar */}
      <div className="bg-green absolute top-0 right-0 h-full w-[var(--long-percentage)]"></div>
      {/* short bar */}
      <div className="bg-danger absolute top-0 left-0 h-full w-[var(--short-percentage)]"></div>
      {!hiddenSplitLine && (
        <div className="absolute top-[50%] left-[var(--short-percentage)] h-[500%] w-[3px] translate-x-[-50%] translate-y-[-50%] rotate-[45deg] bg-[#101114]"></div>
      )}
    </div>
  )
}
