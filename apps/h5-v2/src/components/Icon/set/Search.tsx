import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Search = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3476_109620)">
        <mask id="mask0_3476_109620" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="17">
          <path d="M15.0005 0.5H0.00292969V16.5H15.0005V0.5Z" fill="white" />
        </mask>
        <g mask="url(#mask0_3476_109620)">
          <path
            d="M12.4946 12.2372L14.7408 14.8391C15.1058 15.2619 15.0492 15.8921 14.6142 16.2471C14.1793 16.602 13.5307 16.5469 13.1657 16.1242L10.901 13.5002C7.66525 15.3887 3.4779 14.5264 1.30823 11.5244C-0.861453 8.52252 -0.276514 4.40132 2.64859 2.08279C5.57369 -0.235746 9.84457 0.0363337 12.4333 2.70619C15.0221 5.37604 15.0488 9.53628 12.4944 12.2372H12.4946ZM7.19798 12.9974C10.3207 12.9974 12.8522 10.5368 12.8522 7.50174C12.8522 4.4667 10.3209 2.00589 7.19798 2.00589C4.07509 2.00589 1.54397 4.46651 1.54397 7.50174C1.54397 10.537 4.07549 12.9974 7.19818 12.9974H7.19798Z"
            fill={props.color || 'currentColor'}
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3476_109620">
          <rect width="15" height="16" fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Search)
export default Icon
