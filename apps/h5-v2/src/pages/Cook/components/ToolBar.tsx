import { type ReactNode, useContext } from 'react'
import { CookContext } from '@/pages/Cook/context.ts'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { CookType } from '@/pages/Cook/type.ts'
const Tabs = ({ value, onChange }: { value: CookType; onChange: (value: CookType) => void }) => {
  const tabs = [
    {
      label: <Trans>Cook</Trans>,
      value: CookType.Cook,
    },
    {
      label: <Trans>Trench</Trans>,
      value: CookType.Trench,
    },
  ]
  return (
    <Box className={'flex items-end gap-[32px] text-center'}>
      {tabs.map((tab) => {
        return (
          <span
            key={tab.value}
            className={`cursor-pointer leading-[1] transition-all ${value === tab.value ? 'text-[32px] font-[900] text-white' : 'text-secondary text-[24px] font-[700]'}`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </span>
        )
      })}
    </Box>
  )
}

export const ToolBar = ({ children }: { children?: ReactNode }) => {
  const { type, setType } = useContext(CookContext)
  return (
    <Box
      className={
        'bg-deep sticky top-[66px] z-[3] flex h-[56px] w-screen items-center justify-between px-[36px] py-[8px]'
      }
    >
      <Tabs value={type} onChange={setType}></Tabs>
      <Box className={'flex items-center gap-[4px] p-[12px]'}>{children}</Box>
    </Box>
  )
}
