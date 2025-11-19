import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ArrowDownLong = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color || 'currentColor'}
        fillRule="evenodd"
        d="M17.774 13.397a.825.825 0 0 0-1.167-1.167l-5.466 5.466V3.439a.825.825 0 1 0-1.65 0v14.259L4.024 12.23a.825.825 0 1 0-1.167 1.167l6.867 6.867h.002l.013.014.001.002.576.575.575-.575.001-.002.014-.013.001-.001 6.867-6.867Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const Icon = withIconColor(ArrowDownLong)
export default Icon // 在这里用！
