import { SearchTypeEnum, type SearchResultContractItem } from '@myx-trade/sdk'
import { useGlobalContractSearchStore } from '../store'
import { FuturesList } from './FuturesList/index'
import { NotFound } from './NotFound'

interface SearchListProps {
  onSelected: (item: SearchResultContractItem) => void
}

export const SearchList = ({ onSelected }: SearchListProps) => {
  //   return <NotFound />
  const { searchTab } = useGlobalContractSearchStore()

  // contract list
  if (SearchTypeEnum.Contract === searchTab) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-[16px] pt-[12px]">
        <FuturesList onSelected={onSelected} />
      </div>
    )
  }

  // cook list
  return <NotFound />
}
