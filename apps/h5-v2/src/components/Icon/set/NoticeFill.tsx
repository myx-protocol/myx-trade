import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const NoticeFill = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 14 14"
      fill="none"
    >
      <g clipPath="url(#clip0_3948_134851)">
        <path
          d="M7 0.873047C3.61758 0.873047 0.875 3.61562 0.875 6.99805C0.875 10.3805 3.61758 13.123 7 13.123C10.3824 13.123 13.125 10.3805 13.125 6.99805C13.125 3.61562 10.3824 0.873047 7 0.873047ZM6.99863 10.6881C6.59121 10.6881 6.26035 10.3572 6.26035 9.9498C6.26035 9.54238 6.59121 9.21152 6.99863 9.21152C7.40605 9.21152 7.73691 9.54238 7.73691 9.9498C7.73555 10.3586 7.40605 10.6881 6.99863 10.6881ZM7.70137 7.73359C7.68086 8.11504 7.37188 8.41855 7.0041 8.4582C7.03145 8.46094 7.05469 8.47324 7.08203 8.47324H6.92891C6.95488 8.47324 6.97949 8.46094 7.00547 8.4582C6.63633 8.41855 6.33418 8.12187 6.31641 7.73359L6.14688 4.04629C6.12773 3.6375 6.44766 3.30527 6.85645 3.30527H7.19688C7.60703 3.30527 7.92285 3.6293 7.89961 4.04629L7.70137 7.73359Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_3948_134851">
          <rect width={props.size} height={props.size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(NoticeFill)
export default Icon // 在这里用！
