import { ChainsSelectRow } from '../ChainsSelectRow'
import { Drawer } from '../Drawer'
import { GlobalSearchHeader } from './GlobalSearchHeader'
import { SearchList } from './SearchList/SearchList'
import { SearchTabs } from './SearchList/SearchTabs'
import { useGlobalContractSearchStore } from './store'
import type { SearchResultContractItem } from '@myx-trade/sdk'

interface GlobalContractSearchProps {
  onClose: () => void
  onOpen: () => void
  isOpen: boolean
  onSelected: (item: SearchResultContractItem) => void
}

export const GlobalContractSearch = ({
  onClose,
  onOpen,
  isOpen,
  onSelected,
}: GlobalContractSearchProps) => {
  const { searchChainId, setSearchChainId } = useGlobalContractSearchStore()
  return (
    <Drawer
      open={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      anchor="bottom"
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          backgroundColor: '#18191F',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          height: 'calc(var(--vh, 1vh) * 70)',
        },
        '& .drawer-body': {
          flex: '1',
        },
      }}
    >
      <div className="flex h-full max-h-[80vh] flex-col pb-[16px]">
        <GlobalSearchHeader onClose={close} />
        <SearchTabs />
        <div className="px-[12px] py-[10px]">
          <ChainsSelectRow
            chainIdSelected={searchChainId || 0}
            onChainIdChange={setSearchChainId}
          />
        </div>
        <SearchList onSelected={onSelected} />
      </div>
    </Drawer>
  )
}
