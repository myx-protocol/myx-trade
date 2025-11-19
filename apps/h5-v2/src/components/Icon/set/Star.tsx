import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Star = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color || '#6D7180'}
        d="M5.457 1.158a.6.6 0 0 1 1.086 0l1.312 2.796a.6.6 0 0 0 .469.34l3.064.384a.6.6 0 0 1 .336 1.033L9.47 7.823a.6.6 0 0 0-.179.55l.582 3.034a.6.6 0 0 1-.878.639L6.29 10.555a.6.6 0 0 0-.58 0l-2.705 1.49a.6.6 0 0 1-.878-.638l.582-3.033a.6.6 0 0 0-.18-.551L.277 5.711a.6.6 0 0 1 .336-1.033l3.064-.384a.6.6 0 0 0 .469-.34l1.312-2.796Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Star)
export default Icon // 在这里用！
