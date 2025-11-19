import type { SVGProps } from 'react'

export interface ArrowRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const ArrowRightIcon = ({
  size = 15,
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
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.39508 1.07344C9.16077 0.839127 8.78087 0.839126 8.54655 1.07344C8.31224 1.30776 8.31224 1.68765 8.54655 1.92197L13.001 6.37643H1.4999C1.16853 6.37643 0.899902 6.64506 0.899902 6.97643C0.899902 7.3078 1.16853 7.57643 1.4999 7.57643H13.001L8.54655 12.0309C8.31224 12.2652 8.31224 12.6451 8.54655 12.8794C8.78087 13.1137 9.16077 13.1137 9.39508 12.8794L14.8031 7.47141C15.0765 7.19804 15.0765 6.75482 14.8031 6.48146L9.39508 1.07344Z"
        fill={color}
      />
    </svg>
  )
}

export default ArrowRightIcon
