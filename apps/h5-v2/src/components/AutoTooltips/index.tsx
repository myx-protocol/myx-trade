import { useState, useRef, useEffect } from 'react'
import { Tooltips, type TooltipsProps } from '../UI/Tooltips'
import { twMerge } from 'tailwind-merge'
type AutoTooltipsProps = Omit<TooltipsProps, 'children' | 'open' | 'onOpen' | 'onClose'>

export const AutoTooltips = ({ title, className, ...props }: AutoTooltipsProps) => {
  const [isEllipsis, setIsEllipsis] = useState(false)
  const ref = useRef<HTMLParagraphElement | null>(null)
  useEffect(() => {
    const checkEllipsis = (element: HTMLParagraphElement) => {
      if (element) {
        const scrollWidth = element.scrollWidth
        const clientWidth = element.clientWidth
        setIsEllipsis(scrollWidth > clientWidth)
      }
    }
    if (ref.current) {
      checkEllipsis(ref.current)
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          checkEllipsis(entry.target as HTMLParagraphElement)
        }
      })
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])
  const [open, setOpen] = useState(false)
  const onChange = (open: boolean) => {
    if (!isEllipsis) return
    setOpen(open)
  }
  return (
    <Tooltips
      {...props}
      title={title}
      open={open}
      onOpen={() => onChange(true)}
      onClose={() => onChange(false)}
    >
      <span className={twMerge('block max-w-full truncate', className)} ref={ref}>
        {title}
      </span>
    </Tooltips>
  )
}
