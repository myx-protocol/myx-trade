import type { SVGProps } from 'react'

export interface EditIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const CloseIcon = ({ size = 16, color = 'white', width, height, ...props }: EditIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_3586_8605)">
        <path
          d="M2.41953 2.51882C2.71242 2.22596 3.18731 2.22594 3.48019 2.51882L7.89961 6.93824L12.319 2.51882C12.6119 2.22594 13.0868 2.22595 13.3797 2.51882C13.6726 2.81172 13.6726 3.28659 13.3797 3.57948L8.96027 7.9989L13.3797 12.4183C13.6726 12.7112 13.6726 13.1861 13.3797 13.479C13.0868 13.7719 12.6119 13.7719 12.319 13.479L7.89961 9.05956L3.48019 13.479C3.1873 13.7719 2.71242 13.7719 2.41953 13.479C2.12666 13.1861 2.12664 12.7112 2.41953 12.4183L6.83895 7.9989L2.41953 3.57948C2.12664 3.28659 2.12664 2.81172 2.41953 2.51882Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_3586_8605">
          <rect width="16" height="16" fill={color} />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CloseIcon
