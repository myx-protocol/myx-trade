import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const IconBars = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 20 17"
      stroke={props.color || 'currentColor'}
      {...props}
    >
      <line y1="-0.5" x2="16" y2="-0.5" transform="matrix(4.37114e-08 1 1 -4.37114e-08 6 1)" />
      <line y1="-0.5" x2="4" y2="-0.5" transform="matrix(-1 0 0 1 9 6)" />
      <line y1="-0.5" x2="3" y2="-0.5" transform="matrix(-1 0 0 1 5 15)" />
      <line y1="-0.5" x2="16" y2="-0.5" transform="matrix(4.37114e-08 1 1 -4.37114e-08 15 0)" />
      <line y1="-0.5" x2="4" y2="-0.5" transform="matrix(-1 0 0 1 15 4)" />
      <line y1="-0.5" x2="3" y2="-0.5" transform="matrix(-1 0 0 1 18 11)" />
    </svg>
  )
}

const Icon = withIconColor(IconBars)
export default Icon // 在这里用！
