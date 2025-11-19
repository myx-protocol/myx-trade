import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const IconBaseLine = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 23 21"
      fill={props.color || 'currentColor'}
      stroke={props.color || 'currentColor'}
      {...props}
    >
      <path d="M1 15.5L3 13.5" />
      <path d="M4 9.5L5 9L6.5 6.5L8 7L9.5 4L12.5 9.5" />
      <path d="M14 13L16.5 17L19 13" />
      <path d="M20 10L22 7" />
      <rect x="1.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="3.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="5.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="7.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="9.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="11.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="13.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="15.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="17.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="19.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
      <rect x="21.25" y="11.25" width="0.5" height="0.5" strokeWidth="0.5" />
    </svg>
  )
}

const Icon = withIconColor(IconBaseLine)
export default Icon // 在这里用！
