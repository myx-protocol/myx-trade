import { useEffect, useState } from 'react'
type ScrollParent = string | React.RefObject<HTMLElement | null>

/**
 * 轮询判断容器是否发生滚动 (scrollTop > 0)
 * 支持传入 ref 或元素 id
 */
export function useHasScrolled<T extends HTMLElement = HTMLElement>(
  refOrId: string | React.RefObject<T | null>,
  interval = 500,
) {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      // 获取元素
      const el =
        typeof refOrId === 'string'
          ? (document.getElementById(refOrId) as T | null)
          : refOrId.current

      if (!el) return

      // 只有状态变化时才 setState，避免重复渲染
      const scrolled = el.scrollTop > 0
      setHasScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }, interval)

    return () => clearInterval(timer)
  }, [refOrId, interval])

  return hasScrolled
}

/**
 * 判断子元素是否在父容器中发生滚动
 * @param cardRef 子元素 ref
 * @param scrollParent 父容器 id 或 ref
 * @param interval 轮询时间 ms
 */
export function useCardScrolled<T extends HTMLElement>(
  cardRef: RefObject<T | null>,
  scrollParent: ScrollParent,
  interval = 1000,
) {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const card = cardRef.current
      const parent =
        typeof scrollParent === 'string'
          ? document.getElementById(scrollParent)
          : scrollParent.current

      if (!card || !parent) return

      const scrollTop = parent.scrollTop
      const cardOffsetTop = card.offsetTop

      // 判断滚动是否发生
      const scrolled = scrollTop > 0 && scrollTop + parent.clientHeight >= cardOffsetTop

      setHasScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }, interval)

    return () => clearInterval(timer)
  }, [cardRef, scrollParent, interval])

  return hasScrolled
}
