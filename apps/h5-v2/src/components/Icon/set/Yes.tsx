import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Yes = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        d="M5.788 10.8a.805.805 0 0 1-.57-.236L1.985 7.32a.815.815 0 0 1 0-1.148.806.806 0 0 1 1.143 0l2.66 2.67 5.082-5.103a.803.803 0 0 1 1.143 0 .813.813 0 0 1 0 1.145L6.36 10.562a.809.809 0 0 1-.572.238Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Yes)
export default Icon
