import type { SVGProps } from 'react'

export interface SureIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const SureIcon = ({ size = 16, color = 'white', width, height, ...props }: SureIconProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 11 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.03788 7.3003C3.83013 7.3003 3.62398 7.2204 3.46737 7.06379L0.236112 3.81974C-0.0787041 3.50333 -0.0787041 2.98876 0.236112 2.67234C0.552526 2.35593 1.0639 2.35593 1.37872 2.67234L4.03948 5.34269L9.12128 0.238509C9.4361 -0.0795031 9.94747 -0.0795031 10.2639 0.238509C10.5787 0.554924 10.5787 1.0679 10.2639 1.38431L4.60998 7.06219C4.45177 7.2204 4.24403 7.3003 4.03788 7.3003Z"
        fill={color}
      />
    </svg>
  )
}

export default SureIcon
