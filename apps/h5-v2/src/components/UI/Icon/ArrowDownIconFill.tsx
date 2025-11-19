import type { SVGProps } from 'react'

export interface ArrowDownIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const ArrowDownIconFill = ({
  size = 16,
  color = 'white',
  width,
  height,
  ...props
}: ArrowDownIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.27362 5.94119C4.15353 6.09719 3.91827 6.09719 3.79818 5.94119L0.943609 2.233C0.79175 2.03573 0.932379 1.75 1.18133 1.75L6.89047 1.75C7.13942 1.75 7.28005 2.03573 7.12819 2.233L4.27362 5.94119Z"
        fill={color}
      />
    </svg>
  )
}

export default ArrowDownIconFill
