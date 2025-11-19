import IconStudyChart from '@/components/Icon/set/TradingViewStudy'
import { tradePubSub } from '@/utils/pubsub'

export const KlineStudy = () => {
  return (
    <div
      className="text-[#9397A3] hover:text-white"
      role="button"
      onClick={() => tradePubSub.emit('kline:show:study:panel')}
    >
      <IconStudyChart size={16} />
    </div>
  )
}
