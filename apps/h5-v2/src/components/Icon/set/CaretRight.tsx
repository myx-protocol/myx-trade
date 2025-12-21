import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const CaretRight = (props: SvgIconProps) => {
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
        d="M14.0239 9.21913L6.6247 3.29976C5.96993 2.77595 5 3.24212 5 4.08062V15.9194C5 16.7579 5.96993 17.2241 6.6247 16.7002L14.0239 10.7809C14.5243 10.3805 14.5243 9.61946 14.0239 9.21913Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(CaretRight)
export default Icon // 在这里用！
