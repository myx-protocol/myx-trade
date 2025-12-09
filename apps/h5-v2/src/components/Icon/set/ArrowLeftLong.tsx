import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ArrowLeftLong = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#fff"
        fillRule="evenodd"
        stroke="#fff"
        strokeWidth={0.5}
        d="M7.822 2.84a.75.75 0 0 1 1.06 1.061l-4.969 4.97h12.962a.75.75 0 0 1 0 1.5H3.913l4.97 4.97a.75.75 0 1 1-1.061 1.06L1.579 10.16l-.001-.002-.012-.012h-.001l-.523-.524.523-.523v-.001l.013-.012.001-.001L7.822 2.84Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const Icon = withIconColor(ArrowLeftLong)
export default Icon // 在这里用！
