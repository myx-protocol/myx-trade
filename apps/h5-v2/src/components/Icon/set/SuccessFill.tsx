import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const SuccessFill = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0C4.47768 0 0 4.47768 0 10C0 15.5223 4.47768 20 10 20C15.5223 20 20 15.5223 20 10C20 4.47768 15.5223 0 10 0ZM14.3192 6.73438L9.6183 13.2522C9.33482 13.6473 8.74777 13.6473 8.46429 13.2522L5.6808 9.39509C5.59598 9.27679 5.6808 9.11161 5.82589 9.11161H6.87277C7.10045 9.11161 7.31696 9.22098 7.45089 9.40848L9.04018 11.6138L12.5491 6.74777C12.683 6.5625 12.8973 6.45089 13.1272 6.45089H14.1741C14.3192 6.45089 14.404 6.61607 14.3192 6.73438Z"
        fill="#00E3A5"
      />
    </svg>
  )
}

const Icon = withIconColor(SuccessFill)
export default Icon // 在这里用！
