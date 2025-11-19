import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ReverseV2 = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 14"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M12.25 8.531v1.313H5.031v1.969L1.75 8.53h10.5ZM8.969 2.625l3.281 3.281H1.75V4.594h7.219V2.625Z"
      />
    </svg>
  )
}

const Icon = withIconColor(ReverseV2)
export default Icon // 在这里用！
