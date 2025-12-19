import clsx from 'clsx'
import { useGlobalSearchStore } from '../store'
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
      width: '20px',
      height: '2px',
      borderRadius: '20px',
      backgroundColor: '#00E3A5',
      content: '""',
    },
  },
})

export const SearchSecondTab = styled(Tab)({
  padding: '11px 10px',
  fontSize: '12px',
  fontWeight: '500',
  lineHeight: '1',
  color: '#848E9C',
  minHeight: 'auto',
  minWidth: 'auto',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: '700',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
})

export const SearchTabs = () => {
  const {
    searchTab,
    setSearchTab,
    secondSearchTab,
    setSecondSearchTab,
    searchLoading,
    searchValue,
  } = useGlobalSearchStore()

  const debouncedSearchValue = useDebounce(searchValue, {
    wait: 500,
  })
  const searchLoadingDebounced = useDebounce(searchLoading, {
    wait: 500,
  })
  return (
    <div>
      <div className="flex gap-[32px] px-[28px]">
        {debouncedSearchValue.trim() && !searchLoadingDebounced && (
          <div
            className="cursor-pointer text-[16px] leading-[1] font-medium select-none"
            onClick={() => setSearchTab(SearchTypeEnum.All)}
          >
            <span
              className={clsx({
                'text-[#999]': searchTab !== SearchTypeEnum.All,
                'text-white': searchTab === SearchTypeEnum.All,
              })}
            >
              {t`All`}
            </span>
          </div>
        )}
        <div
          className="cursor-pointer text-[16px] leading-[1] font-medium select-none"
          onClick={() => setSearchTab(SearchTypeEnum.Contract)}
        >
          <span
            className={clsx({
              'text-[#999]': searchTab !== SearchTypeEnum.Contract,
              'text-white': searchTab === SearchTypeEnum.Contract,
            })}
          >
            {t`Contract`}
          </span>
        </div>
        <div
          className="cursor-pointer text-[16px] leading-[1] font-medium select-none"
          onClick={() => setSearchTab(SearchTypeEnum.Cook)}
        >
          <span
            className={clsx({
              'text-[#999]': searchTab !== SearchTypeEnum.Cook,
              'text-white': searchTab === SearchTypeEnum.Cook,
            })}
          >
            {t`Cook`}
          </span>
        </div>
        <div
          className="cursor-pointer text-[16px] leading-[1] font-medium select-none"
          onClick={() => setSearchTab(SearchTypeEnum.Earn)}
        >
          <span
            className={clsx({
              'text-[#999]': searchTab !== SearchTypeEnum.Earn,
              'text-white': searchTab === SearchTypeEnum.Earn,
            })}
          >
            {t`Earn`}
          </span>
        </div>
      </div>

      {/* second tabs */}
      {searchTab === SearchTypeEnum.Contract && (
        <div className="mx-[16px] mt-[8px] mb-[4px] border-b-[1px] border-b-[#202129] px-[6px]">
          <SearchSecondTabs
            value={secondSearchTab}
            onChange={(_, newValue) => setSecondSearchTab(newValue)}
          >
            <SearchSecondTab
              sx={{
                padding: '11px 10px',
                fontSize: '12px',
                fontWeight: '700',
                lineHeight: '1',
                color: '#848E9C',
              }}
              value={SearchSecondTypeEnum.Favorite}
              label={t`Favorite`}
            />

            <SearchSecondTab
              sx={{
                padding: '11px 10px',
                fontSize: '12px',
                fontWeight: '700',
                lineHeight: '1',
                color: '#848E9C',
              }}
              value={SearchSecondTypeEnum.BlueChips}
              label={t`Blue Chips`}
            />
            <SearchSecondTab
              sx={{
                padding: '11px 10px',
                fontSize: '12px',
                fontWeight: '700',
                lineHeight: '1',
                color: '#848E9C',
              }}
              value={SearchSecondTypeEnum.Alpha}
              label={t`Alpha`}
            />
          </SearchSecondTabs>
        </div>
      )}
    </div>
  )
}
