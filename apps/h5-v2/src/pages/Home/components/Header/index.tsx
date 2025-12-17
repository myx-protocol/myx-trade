import MLogo from '@/assets/home/m-logo.png'
import MenuSimple from '@/assets/home/simple-menu.png'
import { SettingDrawer } from '@/components/SettingDrawer'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useHomeStore } from '../../store'
import { getChainInfo } from '@/config/chainInfo'
import SortDownIcon from '@/components/Icon/set/SortDown'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { ChainsDrawer } from '@/components/ChainsDrawer'

interface HeaderProps {
  isConnected?: boolean
}

export const Header = ({ isConnected }: HeaderProps) => {
  const [settingDialogOpen, setSettingDialogOpen] = useState(false)
  const homeStore = useHomeStore()
  const selectChainInfo = useMemo(() => {
    try {
      return getChainInfo(homeStore.chainId)
    } catch (error) {
      return null
    }
  }, [homeStore.chainId])

  const [chainSelectOpen, setChainSelectOpen] = useState(false)

  if (isConnected) {
    return (
      <>
        <div className="sticky top-0 left-0 z-20 flex w-full items-center justify-between bg-[#101114] px-[16px] py-[15px]">
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
          {/* chain selector */}
          <div
            className="flex items-center justify-end gap-[4px]"
            role="button"
            onClick={() => setChainSelectOpen(true)}
          >
            <CoinIcon size={20} icon={selectChainInfo?.logoUrl ?? ''} />
            <SortDownIcon size={10} color="#848E9C" />
          </div>
          <ChainsDrawer
            showAllChain={false}
            chainId={homeStore.chainId}
            open={chainSelectOpen}
            onChainChange={(chainId) => homeStore.setChainId(chainId as number)}
            onClose={() => setChainSelectOpen(false)}
          />
        </div>
        <SettingDrawer open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
      </>
    )
  }
  return (
    <>
      <div className="sticky top-0 left-0 z-20 w-full bg-[#101114] px-[16px] pt-[10px] pb-[5px]">
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
