import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const CheckBoxBorder = (props: SvgIconProps) => {
  return (
    <svg width={props.size} height={props.size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        width={15}
        height={15}
        x={0.5}
        y={0.5}
        stroke={props.color || 'currentColor'}
        rx={2.7}
      />
    </svg>
  )
}

const Icon = withIconColor(CheckBoxBorder)
export default Icon // 在这里用！
