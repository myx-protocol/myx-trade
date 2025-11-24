import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Share = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#fff"
          d="M8 0a.68.68 0 1 1 0 1.362A6.639 6.639 0 1 0 8 14.64 6.64 6.64 0 0 0 14.64 8 .68.68 0 1 1 16 8 8.001 8.001 0 0 1 0 8c0-4.417 3.583-8 8-8Zm4.118 3.402a.664.664 0 0 1 .01-.935.67.67 0 0 1 .941-.005l1.172 1.172a.905.905 0 0 1 0 1.279L13.07 6.085a.667.667 0 1 1-.944-.944l.199-.199h-.862c-2.344 0-3.14.998-3.14 4.018a.666.666 0 1 1-1.335 0c0-3.735 1.361-5.353 4.477-5.353h.857l-.203-.205Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Share)
export default Icon
