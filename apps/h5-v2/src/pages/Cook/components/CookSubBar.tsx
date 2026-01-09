import { SubTabBar } from '@/components/SubTabBar.tsx'
import { Trans } from '@lingui/react/macro'
import { type ReactNode, useContext, useState } from 'react'
import { CookListType } from '../type'
import { CookContext } from '../context'
import { FilterLine } from '@/components/Icon'
import { useCookFilter } from '@/pages/Cook/hook/useCookFilter.ts'
import { DialogFilters } from '@/components/Dialog/DialogFilters.tsx'

const items = [
  {
    label: <Trans>Token Sniper</Trans>,
    value: CookListType.Sniper,
  },
  {
    label: <Trans>Cook_Sub_Bar_New</Trans>,
    value: CookListType.New,
  },
  {
    label: <Trans>Soon</Trans>,
    value: CookListType.Soon,
  },
]

export const CookSubBar = ({ className, end }: { className?: string; end?: ReactNode }) => {
  const { cookType, setCookType } = useContext(CookContext)
  const {
    age,
    setAge,
    mc,
    setMC,
    progress,
    setProgress,
    change,
    setChange,
    liq,
    setLiq,
    holders,
    setHolders,
    count,
    clear,
  } = useCookFilter()
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <SubTabBar
        items={items}
        value={cookType}
        className={className}
        handleChange={(_value) => setCookType(_value as CookListType)}
        end={
          <FilterLine
            className={`mr-[16px] cursor-pointer ${count ? 'text-green' : ''}`}
            size={12}
            onClick={() => setFiltersOpen(true)}
          />
        }
      />
      <DialogFilters
        data={{ age, mc, progress, change, liq, holders }}
        open={filtersOpen}
        showCloseIcon
        onClose={(_, data) => {
          setFiltersOpen(false)
          if (data?.age) {
            setAge(data?.age)
          }
          if (data?.mc) {
            setMC(data.mc)
          }
          if (data?.change) {
            setChange(data.change)
          }
          if (data?.liq) {
            setLiq(data.liq)
          }
          if (data?.progress) {
            setProgress(data.progress)
          }
          if (data?.holders) {
            setHolders(data.holders)
          }
        }}
      />
    </>
  )
}
