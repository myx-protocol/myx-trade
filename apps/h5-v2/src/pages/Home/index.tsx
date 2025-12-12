import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { AccountInfo } from './components/AccountInfo'
import { ActivitySwiper } from './components/ActivitySwiper'
import { Banner } from './components/Banner'
import { ExpressMenu } from './components/ExpressMenu'
import { Header } from './components/Header'
import { MarketList } from './components/MarketList'

export const Home = () => {
  const { isWalletConnected } = useWalletConnection()
  return (
    <>
      <Header isConnected={isWalletConnected} />
      {!isWalletConnected && <Banner />}
      {isWalletConnected && <AccountInfo />}
      {isWalletConnected && <ExpressMenu />}
      <ActivitySwiper />
      <MarketList />
    </>
  )
}
