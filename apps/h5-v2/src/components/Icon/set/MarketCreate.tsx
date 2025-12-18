import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const MarketCreate = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      {...props}
    >
      <path
        fill="#F29D39"
        d="M9.014 2H3.286A.294.294 0 0 0 3 2.3v1.8c0 .104.052.197.13.25l1.763 1.848L3.12 8.057A.305.305 0 0 0 3 8.3v1.8c0 .165.129.3.286.3h5.728a.294.294 0 0 0 .286-.3V8.3a.308.308 0 0 0-.012-.084v-.002a.235.235 0 0 0-.003-.008l-.002-.008-.001-.003a.299.299 0 0 0-.066-.107l-1.804-1.89 1.78-1.864A.305.305 0 0 0 9.3 4.1V2.3c0-.165-.129-.3-.286-.3ZM6.83 5.959a.306.306 0 0 0-.111.24.307.307 0 0 0 .111.239l1.896 1.986V9.8H3.573V8.43l1.902-1.992a.294.294 0 0 0 .111-.24.307.307 0 0 0-.111-.24L3.573 3.967V2.6h5.154v1.372L6.831 5.96Z"
      />
      <path
        fill="#F29D39"
        d="M4.432 8.9c0 .165.129.3.286.3h2.864a.294.294 0 0 0 .286-.3c0-.165-.128-.3-.286-.3H4.718a.294.294 0 0 0-.286.3Z"
      />
    </svg>
  )
}

const Icon = withIconColor(MarketCreate)
export default Icon // 在这里用！
