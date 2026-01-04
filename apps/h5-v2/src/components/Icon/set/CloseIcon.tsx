import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const CloseIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clipPath="url(#clip0_3948_90290)">
        <path
          d="M2.41953 2.51895C2.71242 2.22608 3.18731 2.22607 3.48019 2.51895L7.89961 6.93836L12.319 2.51895C12.6119 2.22606 13.0868 2.22607 13.3797 2.51895C13.6726 2.81184 13.6726 3.28671 13.3797 3.57961L8.96027 7.99902L13.3797 12.4184C13.6726 12.7113 13.6726 13.1862 13.3797 13.4791C13.0868 13.772 12.6119 13.772 12.319 13.4791L7.89961 9.05968L3.48019 13.4791C3.1873 13.772 2.71242 13.772 2.41953 13.4791C2.12666 13.1862 2.12664 12.7113 2.41953 12.4184L6.83895 7.99902L2.41953 3.57961C2.12664 3.28671 2.12664 2.81184 2.41953 2.51895Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_3948_90290">
          <rect width={props.size} height={props.size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(CloseIcon)
export default Icon // 在这里用！
