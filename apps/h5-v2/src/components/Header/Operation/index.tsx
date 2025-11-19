import { HeaderSearch } from './Search'
import { HeaderCommunity } from './Community'
import { HeaderLanguage } from './Langage'
import { HeaderSetting } from './Setting'
import { Transactions } from './Transactions'
import { WalletConnect } from '@/components/WalletConnect'

export const MenuOperation = () => {
  return (
    <div className="flex gap-[20px] items-center ">
      <HeaderSearch />
      <Transactions />
      <WalletConnect />
      <HeaderCommunity />
      <HeaderLanguage />
      <HeaderSetting />
    </div>
  )
}
