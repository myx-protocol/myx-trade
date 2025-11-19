import type { SVGProps } from 'react'

export interface InfoIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const InfoIcon = ({ size = 16, color = 'white', width, height, ...props }: InfoIconProps) => {
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
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1" fill="none" />
      <circle cx="8" cy="11" r="0.8" fill={color} />
      <rect x="7.4" y="4" width="1.2" height="5" fill={color} />
    </svg>
  )
}

export default InfoIcon
