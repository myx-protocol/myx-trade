import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const EditSimply = ({ size, color, ...props }: SvgIconProps) => {
  return (
    <svg width={size} height={size} {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_3476_110291)">
        <path
          d="M1.19041 11.2482C0.947581 11.2482 0.75 11.0506 0.75 10.8078V8.40296C0.75 8.28538 0.795873 8.17484 0.879007 8.09155L8.09339 0.877056C8.17653 0.79392 8.28722 0.748047 8.4048 0.748047C8.52237 0.748047 8.63306 0.793764 8.7162 0.877056L11.121 3.28189C11.2927 3.45364 11.2927 3.73295 11.121 3.9047L3.90661 11.1192C3.82347 11.2023 3.71278 11.2482 3.5952 11.2482H1.19041ZM1.63098 8.5852V10.3672H3.41297L8.45004 5.33006L6.66805 3.54805L1.63098 8.5852ZM7.29086 2.92523L9.07285 4.70725L10.1868 3.59329L8.4048 1.81128L7.29086 2.92523Z"
          fill={color || 'currentColor'}
        />
        <path
          d="M6 11.2482C5.75717 11.2482 5.55959 11.0506 5.55959 10.8078C5.55959 10.565 5.75717 10.3674 6 10.3674H10.8096C11.0524 10.3674 11.25 10.565 11.25 10.8078C11.25 11.0506 11.0524 11.2482 10.8096 11.2482H6Z"
          fill={color || 'currentColor'}
        />
      </g>
      <defs>
        <clipPath id="clip0_3476_110291">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(EditSimply)
export default Icon
