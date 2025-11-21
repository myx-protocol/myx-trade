import { AccountInfo } from './components/AccountInfo'
import { ActivitySwiper } from './components/ActivitySwiper'
import { Banner } from './components/Banner'
import { ExpressMenu } from './components/ExpressMenu'
import { Header } from './components/Header'
import { MarketList } from './components/MarketList'

export const Home = () => {
  const isConnected = false
  return (
    <div>
      <Header isConnected={isConnected} />
      {!isConnected && <Banner />}
      {isConnected && <AccountInfo />}
      {isConnected && <ExpressMenu />}
      <ActivitySwiper />
      <MarketList />
    </div>
  )
}
