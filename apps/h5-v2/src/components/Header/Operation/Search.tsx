// import IconSearch from '@/assets/svg/header/search.svg?react'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store'
import IconSearch from '@/components/Icon/set/SearchIcon'
import { useLocation } from 'react-router-dom'
import { MENU_LIST } from '../const'
import { SearchTypeEnum } from '@myx-trade/sdk'
export const HeaderSearch = () => {
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const location = useLocation()
  const handleClick = () => {
    const searchTypeByPage =
      MENU_LIST.find((item) => location.pathname.startsWith(item.href ?? ''))?.searchType ||
      SearchTypeEnum.All
    openGlobalSearch({
      defaultTab: searchTypeByPage,
    })
  }
  return (
    <div className="flex cursor-pointer items-center gap-[10px]">
      <IconSearch size={14} color="#fff" onClick={handleClick} />
    </div>
  )
}
