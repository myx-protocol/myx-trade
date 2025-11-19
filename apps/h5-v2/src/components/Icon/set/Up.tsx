import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Up = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        d="M7.979 13a.496.496 0 0 0 .495-.496v-7.11l2.494 2.52a.504.504 0 0 0 .726 0 .517.517 0 0 0 0-.731l-3.41-3.449a.503.503 0 0 0-.725 0l-3.41 3.452a.569.569 0 0 0-.149.37c0 .133.055.262.152.361a.506.506 0 0 0 .362.154.505.505 0 0 0 .361-.154l2.607-2.64v7.227c0 .274.223.496.497.496Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Up)
export default Icon // 在这里用！
