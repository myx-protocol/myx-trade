import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ChangePosition = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.4375 0H10.3125L10.3125 10.3125H13.125L8.4375 15L8.4375 0ZM0 4.6875L4.6875 0L4.6875 15H2.8125L2.8125 4.6875H0Z"
        fill={props.color || 'currentColor'}
      />
    </svg>
  )
}

const Icon = withIconColor(ChangePosition)
export default Icon // 在这里用！
