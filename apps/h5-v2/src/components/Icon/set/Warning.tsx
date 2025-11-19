import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Warning = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 14 16"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M7 2.873a6.125 6.125 0 1 0 0 12.25 6.125 6.125 0 0 0 0-12.25Zm-.001 9.815a.739.739 0 1 1 0-1.477.739.739 0 0 1 0 1.477ZM7.7 9.734a.783.783 0 0 1-.697.724c.027.003.05.015.078.015h-.153c.026 0 .05-.012.076-.015a.766.766 0 0 1-.689-.724l-.17-3.688a.704.704 0 0 1 .71-.74h.34a.69.69 0 0 1 .704.74L7.7 9.734Z"
      />
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 2h14v14H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Warning)
export default Icon // 在这里用！
