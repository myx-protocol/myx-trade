import { Drawer } from '@mui/material'
import { GlobalSearchHeader } from './GlobalSearchHeader'
import { SearchHistory } from './SearchHistory'
import { SearchList } from './SearchList/SearchList'
import { SearchTabs } from './SearchList/SearchTabs'
import { useGlobalSearchStore } from './store'

export const GlobalSearch = () => {
  const { isOpen, close } = useGlobalSearchStore()
  return (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onClose={close}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#18191F',
            borderRadius: '16px 16px 0 0',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <div className="mx-auto my-[10px] h-[4px] w-[40px] flex-shrink-0 rounded-full bg-[#31333D]" />
      <div className="flex min-h-0 flex-1 flex-col pb-[16px]">
        <GlobalSearchHeader onClose={close} />
        <SearchHistory />
        <SearchTabs />
        <SearchList />
      </div>
    </Drawer>
  )
}
