import type { SVGProps } from 'react'

export interface ArrowDownIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const ArrowDownIcon = ({
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
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.8518 5.15063C14.0527 5.35147 14.0527 5.6771 13.8518 5.87794L8.00244 11.7273L2.15307 5.87794C1.95223 5.6771 1.95223 5.35147 2.15307 5.15063C2.35391 4.94979 2.67954 4.94979 2.88038 5.15063L8.00244 10.2727L13.1245 5.15063C13.3253 4.94979 13.651 4.94979 13.8518 5.15063Z"
        fill={color}
      />
    </svg>
  )
}

export default ArrowDownIcon
