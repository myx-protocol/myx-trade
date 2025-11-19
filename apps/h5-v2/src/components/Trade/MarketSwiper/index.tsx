import { ArrowDown } from '@/components/Icon'
import { MarketSwiperItem } from './MarketSwiperItem'
import { useState, useRef, useEffect } from 'react'

export const MarketSwiper = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  // 检查滚动状态
  const checkScrollState = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const { scrollLeft, scrollWidth, clientWidth } = container

    setCanScrollPrev(scrollLeft > 0)
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1) // -1 是为了处理精度问题
  }

  // 滚动到上一页
  const scrollPrev = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const containerWidth = container.clientWidth // 获取父容器的可见宽度
    const currentScroll = container.scrollLeft
    const newScroll = Math.max(0, currentScroll - containerWidth)

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    })
  }

  // 滚动到下一页
  const scrollNext = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const containerWidth = container.clientWidth // 获取父容器的可见宽度
    const currentScroll = container.scrollLeft
    const maxScroll = container.scrollWidth - container.clientWidth
    const newScroll = Math.min(maxScroll, currentScroll + containerWidth)

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    })
  }

  // 监听滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollState()
    container.addEventListener('scroll', checkScrollState)

    return () => {
      container.removeEventListener('scroll', checkScrollState)
    }
  }, [])

  return (
    <div className="mt-[4px] flex w-full bg-[#101114] px-[16px]">
      {/* prev */}
      <div className="mr-[8px] flex items-center">
        {canScrollPrev && (
          <span
            role="button"
            className="inline-flex rotate-[90deg] cursor-pointer items-center transition-opacity hover:opacity-70"
            onClick={scrollPrev}
          >
            <ArrowDown size={14} color="#848E9C" />
          </span>
        )}
      </div>

      {/* scrollbar */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex flex-[1_1_0%] gap-[8px] overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
        <MarketSwiperItem />
      </div>

      {/* next */}
      <div className="ml-[8px] flex items-center">
        {canScrollNext && (
          <span
            role="button"
            className="inline-flex rotate-[-90deg] cursor-pointer items-center transition-opacity hover:opacity-70"
            onClick={scrollNext}
          >
            <ArrowDown size={14} color="#848E9C" />
          </span>
        )}
      </div>
    </div>
  )
}
