import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Tpsl = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      {...props}
    >
      <rect
        x="0.4"
        y="0.4"
        width="11.2"
        height="11.2"
        rx="0.6"
        stroke={props.color || 'currentColor'}
        strokeWidth="0.8"
      />
      <path
        d="M6.3842 8.86394L7.4248 9.93474L4.7828 9.97374L4.8044 7.23894L5.7572 8.21914L9.4344 4.67134L10.0504 5.32634L6.3842 8.86374V8.86394ZM2.5712 7.36854L1.95 6.71874L5.5868 3.15054L4.537 2.08874L7.1786 2.02734L7.1794 4.76214L6.2188 3.78994L2.5712 7.36874V7.36854Z"
        fill={props.color || 'currentColor'}
      />
    </svg>
  )
}

const Icon = withIconColor(Tpsl)
export default Icon
