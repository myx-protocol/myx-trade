import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Earn = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 20 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        fillRule="evenodd"
        d="M10.5 18a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Zm-.45-11.879a.614.614 0 0 1 .856 0l2.939 2.95c.12.11.181.261.181.422a.62.62 0 0 1-.181.422l-2.949 2.949a.579.579 0 0 1-.423.181.621.621 0 0 1-.422-.181L7.102 9.915a.563.563 0 0 1-.181-.422c0-.151.07-.312.181-.423l2.949-2.949Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const Icon = withIconColor(Earn)
export default Icon
