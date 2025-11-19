import IconMore from '@/assets/svg/header/more.svg?react'
import { useBoolean } from 'ahooks'
import { SettingDrawer } from './SettingDrawer'
export const HeaderSetting = () => {
  const [open, { toggle, set }] = useBoolean(false)
  return (
    <>
      <div className="flex items-center cursor-pointer" onClick={toggle}>
        <IconMore className="w-[16px] h-[16px]" />
      </div>
      <SettingDrawer open={open} onOpenChange={set} />
    </>
  )
}
