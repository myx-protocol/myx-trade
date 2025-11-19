import { useRef } from 'react'
import { Toolbar } from './Toolbar'
import { TradingView } from './TradingView'
import { useMount, useUnmount } from 'ahooks'
import { tradePubSub } from '@/utils/pubsub'
import { toggleFullScreen } from '@/utils'
export const Charts = () => {
  const chartsRoot = useRef<HTMLDivElement>(null)

  const onFullScreenToggle = () => {
    if (chartsRoot.current) {
      toggleFullScreen(chartsRoot.current)
    }
  }
  useMount(() => {
    tradePubSub.on('kline:full:screen:toggle', onFullScreenToggle)
  })

  useUnmount(() => {
    tradePubSub.off('kline:full:screen:toggle', onFullScreenToggle)
  })
  return (
    <div
      className="mt-[4px] flex h-[528px] w-full flex-col gap-[6px] bg-[#101114]"
      ref={chartsRoot}
    >
      <Toolbar />
      <div className="flex flex-[1_1_0%] flex-col">
        <TradingView />
      </div>
    </div>
  )
}
