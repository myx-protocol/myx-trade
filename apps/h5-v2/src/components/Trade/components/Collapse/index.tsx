import { ArrowDown } from '@/components/Icon'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'

interface CollapseProps {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export const Collapse = ({ title, children, defaultOpen = false }: CollapseProps) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t-[1px] border-[#202129] pt-[24px] pb-[24px]">
      {/* title */}
      <div
        className="flex items-center justify-between pt-[6px]"
        role="button"
        onClick={() => setOpen(!open)}
      >
        <p className="text-[14px] leading-[1] font-medium text-[#CED1D9]">{title}</p>
        <span
          className={clsx('inline-flex origin-center transition-transform duration-200', {
            'rotate-0': open,
            'rotate-180': !open,
          })}
          role="button"
        >
          <ArrowDown size={14} color="#CED1D9" />
        </span>
      </div>
      {/* content */}
      <AnimatePresence initial={false} mode="wait">
        {open && (
          <motion.div
            className="mt-[16px]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
