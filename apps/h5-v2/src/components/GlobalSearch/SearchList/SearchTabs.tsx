import clsx from 'clsx'
import { useGlobalSearchStore } from '../store'
import { t } from '@lingui/core/macro'
import { styled, Tab, Tabs } from '@mui/material'
import { SearchTypeEnum, SearchSecondTypeEnum } from '@myx-trade/sdk'
import { useDebounce } from 'ahooks'
import { Trans } from '@lingui/react/macro'
import { ArrowDown } from '@/components/Icon'
import { useMemo, useState } from 'react'
import { ChainsDrawer } from '@/components/ChainsDrawer'
import { getChainInfo } from '@/config/chainInfo'

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
  '& .MuiTabs-list': {
    gap: '20px',
  },
})

export const SearchSecondTab = styled(Tab)({
  padding: '11px 0px',
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
    searchChainId,
    setSearchChainId,
  } = useGlobalSearchStore()

  const [chainSelectOpen, setChainSelectOpen] = useState(false)

  const debouncedSearchValue = useDebounce(searchValue, {
    wait: 200,
  })
  const searchLoadingDebounced = useDebounce(searchLoading, {
    wait: 200,
  })
  const chainSelectInfo = useMemo(() => {
    if (!searchChainId) return null
    try {
      return getChainInfo(searchChainId)
    } catch (_) {
      return null
    }
  }, [searchChainId])
  return (
    <div>
      <div className="flex items-center justify-between gap-[20px]">
        <div className="flex flex-[1_1_0%] gap-[24px] pl-[16px]">
          {debouncedSearchValue.trim() && !searchLoadingDebounced && (
            <div
              className="cursor-pointer text-[16px] leading-[1] font-medium select-none"
              onClick={() => setSearchTab(SearchTypeEnum.All)}
            >
              <span
                className={clsx({
                  'text-[#6D7180]': searchTab !== SearchTypeEnum.All,
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
                'text-[#6D7180]': searchTab !== SearchTypeEnum.Contract,
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
                'text-[#6D7180]': searchTab !== SearchTypeEnum.Cook,
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
                'text-[#6D7180]': searchTab !== SearchTypeEnum.Earn,
                'text-white': searchTab === SearchTypeEnum.Earn,
              })}
            >
              {t`Earn`}
            </span>
          </div>
        </div>
        <div
          className="flex items-center justify-end gap-[2] pr-[16px] text-[#CED1D9]"
          role="button"
          onClick={() => setChainSelectOpen(true)}
        >
          <span className="text-[12px]">
            {chainSelectInfo ? chainSelectInfo.label : t`All Chain`}
          </span>
          <ArrowDown size={12} color="#CED1D9" />
        </div>
        <ChainsDrawer
          open={chainSelectOpen}
          onClose={() => setChainSelectOpen(false)}
          chainId={searchChainId || undefined}
          onChainChange={(chainId) => {
            setSearchChainId(chainId ? (chainId as number) : null)
            setChainSelectOpen(false)
          }}
        />
      </div>

      {/* second tabs */}
      {searchTab === SearchTypeEnum.Contract && (
        <div className="mx-[16px] mt-[8px] mb-[4px] border-b-[1px] border-b-[#202129]">
          <SearchSecondTabs
            value={secondSearchTab}
            onChange={(_, newValue) => setSecondSearchTab(newValue)}
          >
            <SearchSecondTab
              sx={{
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
