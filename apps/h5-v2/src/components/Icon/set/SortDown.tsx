import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const SortDown = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 5 4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M2.81 3.285c-.14.188-.49.188-.631 0L.049.424C-.09.235.085 0 .365 0h4.259c.28 0 .455.235.315.424L2.81 3.284Z"
      />
    </svg>
  )
}

const Icon = withIconColor(SortDown)
export default Icon // 在这里用！
