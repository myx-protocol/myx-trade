import { Dialog } from '@mui/material'
import { GlobalSearchHeader } from './GlobalSearchHeader'
import { SearchHistory } from './SearchHistory'
import { SearchList } from './SearchList/SearchList'
import { SearchTabs } from './SearchList/SearchTabs'
import { useGlobalSearchStore } from './store'

export const GlobalSearch = () => {
  const { isOpen, close } = useGlobalSearchStore()
  return (
    <Dialog
      open={isOpen}
      onClose={close}
      sx={{
        '& .MuiDialog-paper': {
          width: '770px',
          backgroundColor: '#18191F',
          borderRadius: '16px',
          maxWidth: '770px',
        },
      }}
    >
      <div className="flex h-[637px] max-h-[80vh] flex-col pb-[16px]">
        <GlobalSearchHeader onClose={close} />
        <SearchHistory />
        <SearchTabs />
        <SearchList />
      </div>
    </Dialog>
  )
}
