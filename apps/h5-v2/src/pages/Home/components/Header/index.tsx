import MLogo from '@/assets/home/m-logo.png'
import MenuSimple from '@/assets/home/simple-menu.png'
import MenuIcon from '@/components/Icon/set/Menu'
import { SettingDrawer } from '@/components/SettingDrawer'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface HeaderProps {
  isConnected?: boolean
}

export const Header = ({ isConnected }: HeaderProps) => {
  const [settingDialogOpen, setSettingDialogOpen] = useState(false)
  if (isConnected) {
    return (
      <>
        <div className="sticky top-0 left-0 z-20 w-full bg-[#101114] px-[16px] py-[15px]">
          <div className="flex items-center justify-start">
            {/* menu */}
            <img
              src={MenuSimple}
              role="button"
              className="w-[20px]"
              onClick={() => setSettingDialogOpen(true)}
            />
            <Link to="/">
              <img src={MLogo} role="button" className="ml-[6px] w-[70px]" />
            </Link>
            {/*  */}
          </div>
        </div>
        <SettingDrawer open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
      </>
    )
  }
  return (
    <>
      <div className="sticky top-0 left-0 z-20 w-full bg-[#101114] px-[16px] pt-[10px] pb-[5px]">
        <div role="button" onClick={() => setSettingDialogOpen(true)}>
          <MenuIcon size={22} color="#fff" />
        </div>
      </div>
      <SettingDrawer open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
    </>
  )
}
