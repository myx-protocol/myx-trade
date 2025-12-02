import type { ReactNode } from 'react'

export type ChangeProps = {
  change?: string
  className?: string
  children?: ReactNode
}
export const Change = ({ change, children, ...reset }: ChangeProps) => {
  return (
    <span {...reset}>
      <span
        className={`${Number(change) > 0 ? 'text-rise' : Number(change) < 0 ? 'text-fall' : ''}`}
      >
        {children}
      </span>
    </span>
  )
}
