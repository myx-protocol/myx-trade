import type { SVGProps } from 'react'

export interface AccountModeProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

const AccountModeIcon = ({
  size = 16,
  color = 'white',
  width,
  height,
  ...props
}: AccountModeProps) => {
  const iconWidth = width || size
  const iconHeight = height || size

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11 10.4499V0.55006C11 0.404237 10.9422 0.264255 10.8389 0.161131C10.7357 0.0580071 10.5958 0 10.4499 0H0.55007C0.404244 0 0.264259 0.0578057 0.161134 0.161131C0.0578067 0.264255 0 0.404237 0 0.55006V10.4499C0 10.5958 0.0578067 10.7357 0.161134 10.8389C0.264259 10.942 0.404244 11 0.55007 11H10.4501C10.7539 11 11 10.7537 11 10.4501V10.4499ZM1.09994 3.29996V1.09992H9.90006V3.29996H1.09994ZM1.09994 9.89988V4.39988H4.95003V9.89988H1.09994ZM6.05017 9.89988V4.39988H9.90006V9.89988H6.05017Z"
        fill={color}
      />
    </svg>
  )
}

export default AccountModeIcon
