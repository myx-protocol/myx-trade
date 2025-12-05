import type { Rating } from '@/request/type.ts'
import type { ReactNode } from 'react'

const Tag = ({ className, children }: { className?: string; children?: ReactNode }) => {
  return (
    <span
      className={`bg-base inline-block w-[14px] rounded-[3px] text-center text-[10px] leading-[14px] font-[400] text-white ${className}`}
    >
      {children}
    </span>
  )
}

export const RatingLevel = ({ rating }: { rating: Rating }) => {
  if (rating === 'A') {
    return <Tag className={'!text-green !bg-brand-10'}>{rating}</Tag>
  }
  if (rating === 'B') {
    return <Tag>{rating}</Tag>
  }
  if (rating === 'C' || rating === 'D') {
    return <Tag className={'!text-warning !bg-warning-10'}>{rating}</Tag>
  }
  return <Tag className={'!text-danger !bg-danger-10'}>{rating}</Tag>
}
