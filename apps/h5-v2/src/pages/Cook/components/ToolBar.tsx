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
    <Box className={'flex items-end gap-[20px] text-center'}>
      {tabs.map((tab) => {
        return (
          <span
            key={tab.value}
            className={`cursor-pointer leading-[1] transition-all ${value === tab.value ? 'text-[18px] font-[700] text-white' : 'text-secondary text-[18px] font-[700]'}`}
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
    <>
      <Box className={'flex h-[34px] w-screen items-center justify-between px-[16px] py-[8px]'}>
        <Tabs value={type} onChange={setType}></Tabs>
      </Box>
      <Box>{children}</Box>
    </>
  )
}
