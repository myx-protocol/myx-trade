import { Tabs as MuiTabs, Tab as MuiTab, styled } from '@mui/material'
import { usePriceStore } from '../store'
import { PriceTabEnum } from '../store'
import { Trans } from '@lingui/react/macro'

const PriceTabs = styled(MuiTabs)({
  minHeight: 'auto',
  '& .MuiTabs-list': {
    gap: '24px',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#fff',
  },
})

const PriceTab = styled(MuiTab)({
  color: '#848E9C',
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '1',
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: '4px',
  paddingBottom: '8px',
  minHeight: 'auto',
  minWidth: 'auto',
  '&.Mui-selected': {
    color: '#fff',
  },
})

export const Tabs = () => {
  const { tab, setTab } = usePriceStore()
  return (
    <div className="border-b border-[#31333D] px-[16px]">
      <PriceTabs value={tab} onChange={(_, value) => setTab(value as PriceTabEnum)}>
        <PriceTab label={<Trans>Price</Trans>} value={PriceTabEnum.Price} />
        <PriceTab label={<Trans>Info</Trans>} value={PriceTabEnum.Info} />
        <PriceTab label={<Trans>Pool</Trans>} value={PriceTabEnum.Pool} />
      </PriceTabs>
    </div>
  )
}
