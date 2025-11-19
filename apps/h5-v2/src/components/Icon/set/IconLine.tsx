import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const IconLine = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 21 21"
      stroke={props.color || 'currentColor'}
      {...props}
    >
      <path d="M1 15L5 11L8 14L13 9.5H16L20 5" />
    </svg>
  )
}

const Icon = withIconColor(IconLine)
export default Icon // 在这里用！
