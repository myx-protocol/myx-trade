import SearchIcon from '@/components/Icon/set/SearchIcon'
import { Tabs } from './components/Tabs/MarketTabs'
import { ChainSelector } from './components/Tabs/ChainSelector'
import { List } from './components/List'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store'

export const MarketList = () => {
  const { open } = useGlobalSearchStore()
  return (
    <div className="flex h-screen flex-col overflow-y-auto pt-[15px]">
      <div className="mr-[16px] ml-[16px] flex rounded-[6px] bg-[#18191F] px-[14px] py-[12px]">
        <SearchIcon
          size={12}
          color="#6D7180"
          onClick={() => {
            open()
          }}
        />
        <p className="ml-[8px] text-[13px] font-medium text-[#6D7180]">BTCUSDC</p>
      </div>
      <Tabs />
      <ChainSelector />
      <List />
    </div>
  )
}
