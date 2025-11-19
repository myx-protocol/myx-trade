import TradingViewFullScreen from '@/components/Icon/set/TradingViewFullScreen'
import TradingViewTakeScreenhot from '@/components/Icon/set/TradingViewTakeScreenhot'
import TradingViewSetting from '@/components/Icon/set/TradingViewSetting'
import { tradePubSub } from '@/utils/pubsub'

export const Operation = () => {
  return (
    <div className="flex items-center justify-end gap-[15px] text-[#9397A3]">
      <div
        role="button"
        className="hover:text-white"
        onClick={() => tradePubSub.emit('kline:show:setting:panel')}
      >
        <TradingViewSetting size={16} />
      </div>
      <div
        role="button"
        className="hover:text-white"
        onClick={() => tradePubSub.emit('kline:full:screen:toggle')}
      >
        <TradingViewFullScreen size={16} />
      </div>
      <div
        role="button"
        className="hover:text-white"
        onClick={() => tradePubSub.emit('kline:take:screenshot')}
      >
        <TradingViewTakeScreenhot size={16} />
      </div>
    </div>
  )
}
