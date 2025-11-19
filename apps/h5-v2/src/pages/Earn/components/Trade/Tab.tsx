import { Box } from '@mui/material'
import { useContext, useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { TradeContext, TradeSide } from '@/pages/Earn/components/Trade/Context.ts'

export const TradeTabBar = () => {
  const { side, setSide } = useContext(TradeContext)
  const tabs = useMemo(() => {
    return [
      {
        label: <Trans>Subscribe</Trans>,
        value: TradeSide.Subscribe,
      },
      {
        label: <Trans>Redeem</Trans>,
        value: TradeSide.Redeem,
      },
    ]
  }, [])
  return (
    <Box className={'flex h-[30px]'}>
      <ul className={'flex gap-[4px] text-[14px] leading-[1] font-[500] text-white'}>
        {tabs.map((tab, i) => {
          return (
            <li
              key={i}
              className={`cursor-pointer rounded-[8px] px-[12px] py-[8px] transition ${tab.value === side ? 'bg-brand-10 text-green' : ''}`}
              onClick={() => setSide(tab.value)}
            >
              {tab.label}
            </li>
          )
        })}
      </ul>
    </Box>
  )
}
