import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ArrowDown = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M17.3146 6.43829C17.5657 6.68934 17.5657 7.09637 17.3146 7.34743L10.0029 14.6591L2.69122 7.34743C2.44017 7.09637 2.44017 6.68934 2.69122 6.43829C2.94227 6.18724 3.3493 6.18724 3.60036 6.43829L10.0029 12.8409L16.4055 6.43829C16.6566 6.18724 17.0636 6.18724 17.3146 6.43829Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="0.2"
        stroke-linecap="round"
      />
    </svg>
  )
}

const Icon = withIconColor(ArrowDown)
export default Icon // 在这里用！
