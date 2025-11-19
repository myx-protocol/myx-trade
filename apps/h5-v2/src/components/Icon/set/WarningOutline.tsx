import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const WarningOutline = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
    >
      <g clipPath="url(#a)">
        <path
          fill={props.color || 'currentColor'}
          fillRule="evenodd"
          d="M10.866 4.022a5.226 5.226 0 0 0-1.152-1.738A5.243 5.243 0 0 0 6 .748a5.244 5.244 0 0 0-5.25 5.25A5.243 5.243 0 0 0 6 11.248a5.24 5.24 0 0 0 5.25-5.25c0-.682-.13-1.346-.384-1.976Zm-.463 1.976a4.381 4.381 0 0 1-1.288 3.115A4.381 4.381 0 0 1 6 10.402a4.38 4.38 0 0 1-3.115-1.289 4.38 4.38 0 0 1-1.288-3.115c0-1.176.457-2.282 1.288-3.114A4.382 4.382 0 0 1 6 1.596c1.176 0 2.282.457 3.115 1.288a4.382 4.382 0 0 1 1.288 3.114ZM6.027 3.3a.607.607 0 0 0-.61.612.607.607 0 0 0 .61.61h.002a.607.607 0 0 0 .61-.612.607.607 0 0 0-.612-.61Zm-.051 1.598h.05c.262 0 .474.212.474.473V8.69a.475.475 0 0 1-.947 0V5.372c0-.244.186-.445.423-.47v-.004Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(WarningOutline)
export default Icon // 在这里用！
