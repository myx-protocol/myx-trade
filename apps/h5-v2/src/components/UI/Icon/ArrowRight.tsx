import type { SVGProps } from 'react'

export interface ArrowRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const ArrowRightIcon = ({
  size = 7,
  color = 'white',
  width,
  height,
  ...props
}: ArrowRightIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 7 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.459195 0.878141C0.63005 0.707286 0.90706 0.707286 1.07791 0.878141L6.05394 5.85417L1.07791 10.8302C0.90706 11.001 0.63005 11.001 0.459195 10.8302C0.288341 10.6593 0.288341 10.3823 0.459195 10.2115L4.8165 5.85417L0.459195 1.49686C0.288341 1.326 0.288341 1.049 0.459195 0.878141Z"
        fill={color}
      />
    </svg>
  )
}

export default ArrowRightIcon
