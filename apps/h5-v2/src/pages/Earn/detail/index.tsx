import { PoolProvider } from '@/pages/Earn/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Cook/detail/components/NavBar.tsx'
import { TabBar } from '@/pages/Cook/detail/components/TabBar.tsx'
import { DetailTabType } from '@/pages/Cook/type.ts'

const Detail = () => {
  return (
    <PoolProvider>
      <div className="flex min-h-screen flex-col pt-[4px] pb-[4px]">
        <div className={'bg-deep sticky top-[0] z-[1]'}>
          <NavBar />
        </div>
      </div>
    </PoolProvider>
  )
}

export default Detail
