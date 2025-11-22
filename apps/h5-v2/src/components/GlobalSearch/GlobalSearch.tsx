import { Dialog, Drawer } from '@mui/material'
import { GlobalSearchHeader } from './GlobalSearchHeader'
import { SearchHistory } from './SearchHistory'
import { SearchList } from './SearchList/SearchList'
import { SearchTabs } from './SearchList/SearchTabs'
import { useGlobalSearchStore } from './store'

export const GlobalSearch = () => {
  const { isOpen, close } = useGlobalSearchStore()
  return (
    <Drawer
      open={isOpen}
      onClose={close}
      anchor="bottom"
      sx={{
        '& .MuiDrawer-paper': {
          width: '100%',
          backgroundColor: '#18191F',
          borderRadius: '16px',
          height: 'calc(var(--vh, 1vh) * 70)',
        },
      }}
    >
      <div className="flex h-[637px] max-h-[80vh] flex-col pb-[16px]">
        <GlobalSearchHeader onClose={close} />
        <SearchHistory />
        <SearchTabs />
        <SearchList />
      </div>
    </Drawer>
  )
}
