import type { SVGProps } from 'react'

export interface BackIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const BackIcon = ({ size = 20, color = 'white', width, height, ...props }: BackIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.82203 3.84174C8.11492 3.54885 8.58979 3.54885 8.88269 3.84174C9.17558 4.13463 9.17558 4.60951 8.88269 4.9024L3.91302 9.87207H16.875C17.2892 9.87207 17.625 10.2079 17.625 10.6221C17.625 11.0363 17.2892 11.3721 16.875 11.3721H3.91301L8.88269 16.3417C9.17558 16.6346 9.17558 17.1095 8.88269 17.4024C8.58979 17.6953 8.11492 17.6953 7.82203 17.4024L1.57924 11.1596L1.57803 11.1584L1.56594 11.1463L1.56474 11.1451L1.04169 10.6221L1.56469 10.0991L1.5659 10.0979L1.57806 10.0857L1.57927 10.0845L7.82203 3.84174Z"
        fill={color}
      />
    </svg>
  )
}

export default BackIcon
