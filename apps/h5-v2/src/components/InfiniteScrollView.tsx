import InfiniteScroll from 'react-infinite-scroll-component'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { useEffect, useRef, type ReactNode } from 'react'

export interface InfiniteScrollViewProps {
  dataLength: number
  children?: ReactNode
  scrollableTarget: null | ReactNode
  loadMore: () => void
  hasMore: boolean
}

export const InfiniteScrollView = ({
  dataLength,
  hasMore,
  children,
  scrollableTarget,
  loadMore,
}: InfiniteScrollViewProps) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!bottomRef.current) return

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    io.observe(bottomRef.current)
    return () => io.disconnect()
  }, [bottomRef.current, loadMore])
  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={loadMore}
      hasMore={hasMore} // 自己判断是否还有下一页
      loader={
        <Box className={'text-placeholder py-[20px] text-center text-[12px]'}>
          <Trans>加载中...</Trans>
        </Box>
      }
      endMessage={
        <Box className={'text-placeholder py-[20px] text-center text-[12px]'}>
          <Trans>已全部加载完毕</Trans>
        </Box>
      }
      scrollableTarget={scrollableTarget}
      scrollThreshold={0.7}
    >
      {children}
      <div ref={bottomRef} className="h-1" />
    </InfiniteScroll>
  )
}
