import SearchIcon from '@/components/Icon/set/SearchIcon'
import { Tabs } from './components/Tabs/MarketTabs'
import { ChainSelector } from './components/Tabs/ChainSelector'
import { List } from './components/List'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store'
import { t } from '@lingui/core/macro'
import { useState } from 'react'

export const MarketList = () => {
  const { open } = useGlobalSearchStore()
  const [isShowFavoritiesDefault, setIsShowFavoritiesDefault] = useState(false)
  const onFavoritiesDefaultChange = (bool: boolean) => {
    setIsShowFavoritiesDefault(bool)
  }
  return (
    <div className="flex h-screen flex-col overflow-y-auto pt-[15px]">
      <title>{t`Markets -  Permissionless Listing for Any Asset | MYX`}</title>
      <div
        className="mr-[16px] ml-[16px] flex rounded-[6px] bg-[#18191F] px-[14px] py-[12px]"
        role="button"
        onClick={() => open()}
      >
        <SearchIcon size={12} color="#6D7180" />
        <p className="ml-[8px] text-[13px] font-medium text-[#6D7180]">BTCUSDC</p>
      </div>
      <Tabs />
      {!isShowFavoritiesDefault && <ChainSelector />}
      <List onFavoritiesDefaultChange={onFavoritiesDefaultChange} />
    </div>
  )
}
