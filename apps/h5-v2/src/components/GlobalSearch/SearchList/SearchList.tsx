import { SearchTypeEnum } from '@myx-trade/sdk'
import { useGlobalSearchStore } from '../store'
import { FuturesList } from './FuturesList/index'
import { NotFound } from './NotFound'
import { CookList } from './CookList'
import { EarnList } from './EarnList'
import { AllList } from './AllList'

export const SearchList = () => {
  //   return <NotFound />
  const { searchTab } = useGlobalSearchStore()

  // contract list
  if (SearchTypeEnum.Contract === searchTab) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-[16px] pt-[12px]">
        <FuturesList />
      </div>
    )
  }

  // cook list
  if (SearchTypeEnum.Cook === searchTab) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-[16px] pt-[12px]">
        <CookList />
      </div>
    )
  }

  // earn list
  if (SearchTypeEnum.Earn === searchTab) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-[16px] pt-[12px]">
        <EarnList />
      </div>
    )
  }

  if (SearchTypeEnum.All === searchTab) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-[16px] pt-[24px]">
        <AllList />
      </div>
    )
  }
  return <NotFound />
}
