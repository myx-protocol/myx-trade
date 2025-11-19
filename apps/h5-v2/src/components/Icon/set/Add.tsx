import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Add = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={20} height={20} fill={props.color || 'currentColor'} rx={10} />
      <path
        fill="#fff"
        d="M10 5.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 10 5.5Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Add)
export default Icon // 在这里用！
