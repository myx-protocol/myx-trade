import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const ArrowRight = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.15063 2.14868C5.35147 1.94784 5.6771 1.94784 5.87794 2.14868L11.7273 7.99805L5.87794 13.8474C5.6771 14.0483 5.35147 14.0483 5.15063 13.8474C4.94979 13.6466 4.94979 13.3209 5.15063 13.1201L10.2727 7.99805L5.15063 2.87599C4.94979 2.67515 4.94979 2.34952 5.15063 2.14868Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(ArrowRight)
export default Icon // 在这里用！
