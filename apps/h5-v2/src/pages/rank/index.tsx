import { SecondHeader } from '@/components/SecondHeader'
import { ResolutionTabs, Tabs } from './components/Tabs'
import { TypeSelector } from './components/Tabs/TypeSelector'
import { List } from './components/List'
import { ChainSelector } from './components/ChainSelector'
import { Trans } from '@lingui/react/macro'

export const Rank = () => {
  return (
    <div className="flex h-screen flex-col">
      <SecondHeader title={<Trans>榜单</Trans>} />
      <Tabs />
      <TypeSelector />
      <div className="mt-[16px] flex items-center justify-between gap-[60px] px-[6px]">
        <div className="flex-[1_1_0%]">
          <ResolutionTabs />
        </div>
        <ChainSelector />
      </div>
      <List />
    </div>
  )
}
