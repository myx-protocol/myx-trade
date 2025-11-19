import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const ChartLineFill = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 15 15"
      fill="none"
    >
      <path
        d="M7.64146 7.26315L5.80393 5.46979L3.32805 7.88437L4.4292 8.95787L5.80393 7.61784L7.64146 9.41015L13.6578 3.97734C14.1621 4.97581 14.4249 6.07842 14.4255 7.19652C14.4271 10.7019 11.8994 13.6991 8.4388 14.2947C4.9782 14.8902 1.59092 12.9113 0.41645 9.60795C-0.758284 6.3043 0.621437 2.63652 3.68389 0.921337C6.74635 -0.794106 10.6014 -0.0582416 12.8137 2.66406L7.64146 7.26315Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(ChartLineFill)
export default Icon // 在这里用！
