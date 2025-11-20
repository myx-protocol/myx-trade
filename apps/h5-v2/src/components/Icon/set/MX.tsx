import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const MX = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill={props.color || 'currentColor'} clipPath="url(#a)">
        <path
          fillRule="evenodd"
          d="M13.201 5 .001 18.257h6.798L19.999 5h-6.798Z"
          clipRule="evenodd"
        />
        <path d="M16.277 14.52 20 18.259h-6.797l-2.534-2.545 1.189-1.194h4.419ZM6.799 5l2.533 2.544-1.056 1.061H3.59L0 5H6.8Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(MX)
export default Icon
