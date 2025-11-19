import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Sub = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={20} height={20} fill={props.color || 'currentColor'} rx={10} />
      <path fill="#fff" d="M13.75 9.25a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h7.5Z" />
    </svg>
  )
}

const Icon = withIconColor(Sub)
export default Icon // 在这里用！
