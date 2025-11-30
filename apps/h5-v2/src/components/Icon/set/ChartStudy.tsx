import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ChartStudy = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 15 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        d="M1.381 8.677.5 7.774l4.737-4.742L8.543 5.29 12.619 1l.881.903-4.737 4.742-3.305-2.258-4.077 4.29ZM5.6 8H4.5v7h1.1V8Z"
      />
      <path
        stroke={props.color || 'currentColor'}
        d="M14.077 10.04v3.321L11.2 15.023l-2.877-1.662V10.04L11.2 8.378l2.878 1.661Z"
      />
      <circle
        cx={11.2}
        cy={11.701}
        r={0.9}
        stroke={props.color || 'currentColor'}
        strokeWidth={0.8}
      />
      <path fill={props.color || 'currentColor'} d="M2.144 10.484H1.042V15h1.102v-4.516Z" />
    </svg>
  )
}

const Icon = withIconColor(ChartStudy)
export default Icon
