import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const ChartArea = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M1 11.8001V14.6001H15V5.5L8 11.8001L4.5 9.00004L1 11.8001Z" fill="currentColor" />
      <path d="M1 8.30007L4.5 5.50004L8 8.30007L15 2" stroke="currentColor" stroke-width="2" />
    </svg>
  )
}

const Icon = withIconColor(ChartArea)
export default Icon // 在这里用！
