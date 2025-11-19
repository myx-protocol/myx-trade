import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Pause = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 11 10"
      fill="none"
    >
      <rect x="1.33301" width="2" height="10" rx="0.5" fill="#F29D39" />
      <rect x="7.33301" width="2" height="10" rx="0.5" fill="#F29D39" />
    </svg>
  )
}

const Icon = withIconColor(Pause)
export default Icon // 在这里用！
