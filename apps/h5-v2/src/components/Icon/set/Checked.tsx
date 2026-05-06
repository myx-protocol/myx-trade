import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Checked = (props: SvgIconProps) => {
  return (
    <svg width={props.size} height={props.size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill={props.color || 'currentColor'}
        d="M12.8 0A3.2 3.2 0 0 1 16 3.2v9.6a3.2 3.2 0 0 1-3.2 3.2H3.2A3.2 3.2 0 0 1 0 12.8V3.2A3.2 3.2 0 0 1 3.2 0h9.6Zm-.054 4.855a.901.901 0 0 0-1.273.017L7.16 9.298 4.55 7.288A.9.9 0 1 0 3.45 8.712l3.247 2.5a.9.9 0 0 0 1.194-.085l4.87-5a.9.9 0 0 0-.016-1.273Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Checked)
export default Icon // 在这里用！
