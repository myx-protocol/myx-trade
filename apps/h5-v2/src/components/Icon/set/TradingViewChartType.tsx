import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const TradingViewChartType = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 10 14"
      fill={props.color || 'currentColor'}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.20352 0H1.50352V2.1H0.103516V11.9H1.50352V14H2.20352V11.9H3.60352V2.1H2.20352V0ZM0.803516 2.8H2.90352V11.2H0.803516V2.8Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.70352 4.2H7.10351V2.1H7.80351V4.2H9.20352V9.8H7.80351V11.9H7.10351V9.8H5.70352V4.2ZM6.40351 4.9H8.50352V9.1H6.40351V4.9Z"
      />
    </svg>
  )
}

const Icon = withIconColor(TradingViewChartType)
export default Icon // 在这里用！
