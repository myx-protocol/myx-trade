import { StudyList } from '@/components/Trade/Charts/StudyList'
import { ToolBar } from './ToolBar'
import { TradingView } from '@/components/Trade/Charts/TradingView'
export const Chart = () => {
  return (
    <div>
      <ToolBar />
      {/* <TradingView /> */}
      <div className="h-[484px] w-full">
        <TradingView poolId="0x7ffff60e4cbf30b25184a7265e5adae24245e02a18884f7d46b44cc7e773cc3d" />
      </div>
      <div className="mt-[4px]">
        <StudyList />
      </div>
    </div>
  )
}
