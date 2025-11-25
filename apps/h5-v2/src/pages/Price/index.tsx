import { Header } from './components/Header'
import { PriceContent } from './components/PriceContent'
import { PriceInfo } from './components/PriceInfo'
import { Tabs } from './components/Tabs'
import { PriceTabEnum, usePriceStore } from './store'

const Price = () => {
  const { tab } = usePriceStore()
  return (
    <div>
      <Header />
      <PriceInfo />
      <Tabs />
      {tab === PriceTabEnum.Price ? <PriceContent /> : <></>}
    </div>
  )
}

export default Price
