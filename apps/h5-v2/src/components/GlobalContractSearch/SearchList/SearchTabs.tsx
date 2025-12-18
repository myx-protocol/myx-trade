import clsx from 'clsx'
import { useGlobalContractSearchStore } from '../store'
import { t } from '@lingui/core/macro'
import { styled, Tab, Tabs } from '@mui/material'
import { SearchTypeEnum, SearchSecondTypeEnum } from '@myx-trade/sdk'
import { useDebounce } from 'ahooks'

const SearchSecondTabs = styled(Tabs)({
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    background: 'transparent',
    '&::before': {
      position: 'absolute',
      left: '50%',
      top: 0,
      transform: 'translateX(-50%)',
      width: '100%',
      height: '1px',
      borderRadius: '20px',
      backgroundColor: '#FFFFFF',
      content: '""',
    },
  },

  '& .MuiTabs-list': {
    gap: '24px',
  },
})

export const SearchSecondTab = styled(Tab)({
  padding: '12px 0px',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1',
  color: '#848E9C',
  minHeight: 'auto',
  minWidth: 'auto',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: '500',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})

export const SearchTabs = () => {
  const { searchTab, secondSearchTab, setSecondSearchTab, searchLoading, searchValue } =
    useGlobalContractSearchStore()

  return (
    <div>
      {searchTab === SearchTypeEnum.Contract && (
        <div className="border-b border-b-[#202129] px-[16px]">
          <SearchSecondTabs
            value={secondSearchTab}
            onChange={(_, newValue) => setSecondSearchTab(newValue)}
          >
            <SearchSecondTab value={SearchSecondTypeEnum.Favorite} label={t`Favorite`} />

            <SearchSecondTab value={SearchSecondTypeEnum.BlueChips} label={t`Blue Chips`} />
            <SearchSecondTab value={SearchSecondTypeEnum.Alpha} label={t`Alpha`} />
          </SearchSecondTabs>
        </div>
      )}
    </div>
  )
}
