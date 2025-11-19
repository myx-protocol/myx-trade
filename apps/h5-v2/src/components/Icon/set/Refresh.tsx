import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Refresh = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
    >
      <g clipPath="url(#a)">
        <path
          fill={props.color || 'currentColor'}
          d="m11.775 1.684-.822.628A6.162 6.162 0 0 0 6.127.014C2.742.014.004 2.684 0 5.989c-.004 3.307 2.74 5.99 6.127 5.99 2.644 0 4.9-1.638 5.759-3.933a.114.114 0 0 0-.072-.147l-.826-.278a.119.119 0 0 0-.15.068 4.852 4.852 0 0 1-1.161 1.77 5.036 5.036 0 0 1-3.546 1.436 5.076 5.076 0 0 1-1.953-.384A4.981 4.981 0 0 1 1.509 7.9a4.773 4.773 0 0 1-.397-1.906c0-.662.133-1.304.395-1.908A4.883 4.883 0 0 1 2.581 2.53a5.04 5.04 0 0 1 3.55-1.436 5.066 5.066 0 0 1 1.95.385 4.961 4.961 0 0 1 2 1.499l-.877.67a.117.117 0 0 0-.042.115.11.11 0 0 0 .085.086l2.563.612a.115.115 0 0 0 .143-.109l.012-2.577c0-.096-.112-.147-.19-.09Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Refresh)
export default Icon // 在这里用！
