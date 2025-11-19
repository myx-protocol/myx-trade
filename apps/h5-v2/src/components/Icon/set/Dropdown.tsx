import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Dropdown = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 10 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M5.283 8.004a.3.3 0 0 1-.476 0L1.087 3.17a.3.3 0 0 1 .237-.483h7.441a.3.3 0 0 1 .238.482l-3.72 4.834Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Dropdown)
export default Icon // 在这里用！
