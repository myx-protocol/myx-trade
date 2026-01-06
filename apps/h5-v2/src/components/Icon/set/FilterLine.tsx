import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const FilterLine = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
    >
      <g clipPath="url(#clip0_3948_103388)">
        <mask
          id="mask0_3948_103388"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={props.size}
          height={props.size}
        >
          <path d="M12.3332 0H0.334961V12H12.3332V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_3948_103388)">
          <path
            d="M8.56527 11.9853C8.50482 11.9853 8.38364 11.9853 8.3232 11.9248L3.96492 9.74784C3.7833 9.62693 3.66226 9.44548 3.66226 9.26403V5.63569L0.817288 2.79351C0.333002 2.3097 0.211968 1.64459 0.454037 1.03987C0.696106 0.434996 1.30143 0.0117188 1.96734 0.0117188H10.6839C11.3498 0.0117188 11.9551 0.374465 12.1972 1.03972C12.4393 1.70483 12.3182 2.37009 11.8339 2.79336L9.11 5.57515V11.441C9.11 11.6224 8.98882 11.8037 8.86778 11.9248C8.74675 11.9853 8.62571 11.9853 8.56512 11.9853H8.56527ZM4.75187 8.90129L8.02054 10.534V5.33347C8.02054 5.21256 8.08113 5.03111 8.20216 4.97058L11.1077 2.06802C11.3498 1.82604 11.2288 1.52368 11.2288 1.46329C11.1682 1.40276 11.0471 1.1004 10.7445 1.1004H1.96734C1.60409 1.1004 1.48305 1.34238 1.48305 1.46329C1.42246 1.52368 1.36202 1.76566 1.60409 2.00749L4.63069 5.03111C4.69113 5.15202 4.75172 5.27294 4.75172 5.39385V8.90129H4.75187Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3948_103388">
          <rect
            width={props.size}
            height={props.size}
            fill="white"
            transform="translate(0.333008)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(FilterLine)
export default Icon // 在这里用！
