import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const SettingIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <g clipPath="url(#a)">
        <path
          fill="#fff"
          d="m9.695.314 6.055 3.325A2.389 2.389 0 0 1 17 5.73v6.525a2.39 2.39 0 0 1-1.25 2.091l-6.055 3.326a2.489 2.489 0 0 1-2.39 0L1.25 14.346A2.388 2.388 0 0 1 0 12.256V5.73a2.39 2.39 0 0 1 1.25-2.09L7.305.313a2.487 2.487 0 0 1 2.39 0ZM8.5 6.075c-1.693 0-3.066 1.308-3.066 2.918S6.807 11.91 8.5 11.91c1.694 0 3.067-1.308 3.067-2.918S10.194 6.075 8.5 6.075Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h17v18H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(SettingIcon)
export default Icon // 在这里用！
