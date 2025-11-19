import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const SortIcon = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      className={`icon-sort ${props.className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        className={'up-arrow'}
        d="M4.99774 0C5.14661 0 5.28616 0.0802913 5.3709 0.214841L7.41419 3.45969C7.51064 3.61238 7.52182 3.81113 7.44346 3.97581C7.3651 4.14034 7.21012 4.24345 7.04103 4.24345H2.95418C2.78523 4.24359 2.63011 4.14034 2.55175 3.97581C2.47339 3.81113 2.4847 3.61238 2.58102 3.45969L4.62444 0.214988C4.70932 0.0802913 4.84887 0 4.99774 0Z"
        fill="currentColor"
      />

      <path
        className={'down-arrow'}
        d="M2.95428 5.74023C2.78533 5.74023 2.63021 5.84334 2.55185 6.00787C2.47336 6.1724 2.48467 6.3713 2.58112 6.52399L4.62454 9.76884C4.70928 9.90339 4.84884 9.98368 4.99784 9.98368C5.14684 9.98368 5.28626 9.90339 5.37114 9.76884L7.41456 6.52399C7.51088 6.3713 7.52218 6.17255 7.44383 6.00787C7.36547 5.84334 7.21035 5.74023 7.04139 5.74023H2.95428Z"
        fill="currentColor"
      />
    </svg>
  )
}
const Icon = withIconColor(SortIcon)
export default Icon // 在这里用！
