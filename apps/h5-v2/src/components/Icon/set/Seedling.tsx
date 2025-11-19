import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const Seedling = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 14 14"
      fill="none"
    >
      <g clip-path="url(#clip0_3948_149299)">
        <mask
          id="mask0_3948_149299"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={props.size}
          height={props.size}
        >
          <path d="M14 0H0V13H14V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_3948_149299)">
          <path
            d="M13.9175 0.139331L13.533 0.0772397C13.1659 0.0298788 12.796 0.00659438 12.4259 0.00786156C11.6614 0.00786156 10.5228 0.105434 9.44148 0.573657C8.60577 0.934804 7.87032 1.77922 7.25524 3.08252C7.19474 3.20828 7.1377 3.33928 7.08175 3.46948C6.97206 3.16837 6.83597 2.87771 6.67489 2.60115C6.3199 1.9948 5.82535 1.48333 5.23306 1.10999C4.11653 0.406548 2.82697 0.031938 1.51023 0.02877C1.13464 0.0243349 0.75953 0.0598159 0.391332 0.134896L0.0500069 0.218372L0.0163772 0.549581C0.0163772 0.55861 -0.060311 1.30561 0.118209 2.26629C0.222241 2.81926 0.390232 3.33373 0.620297 3.79356C0.898763 4.36158 1.29729 4.86132 1.78791 5.25763C2.47417 5.80489 3.20177 6.20992 3.95121 6.45923C4.51097 6.64424 4.99451 6.80343 5.61367 6.80343C5.74631 6.80343 5.86951 6.80898 5.98423 6.81293C6.15552 6.81975 6.30937 6.82767 6.44876 6.81468V12.9838H7.54408V5.49222L7.6258 5.5052C8.13008 5.58298 8.65119 5.66202 9.0923 5.66202C10.7122 5.66202 11.9659 5.2033 12.8178 4.29948C14.2523 2.77443 13.9765 0.58332 13.9636 0.491291L13.9171 0.139173H13.9175V0.139331Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3948_149299">
          <rect width={props.size} height={props.size} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Seedling)
export default Icon // 在这里用！
