import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Cook = (props: SvgIconProps) => {
  return (
    <svg width={props.size} height={props.size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#a)">
        <mask
          id="b"
          width={11}
          height={12}
          x={0}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: 'luminance',
          }}
        >
          <path fill="#fff" d="M11 0H.002v12H11V0Z" />
        </mask>
        <g mask="url(#b)">
          <path
            fill={props.color || 'currentColor'}
            d="M0 11.545a.43.43 0 0 1 .423-.438H10.57a.43.43 0 0 1 .422.438c0 .242-.19.439-.422.439H.423A.43.43 0 0 1 0 11.545Zm0-1.753a.43.43 0 0 1 .423-.438H10.57a.43.43 0 0 1 .422.438.43.43 0 0 1-.422.438H.423A.43.43 0 0 1 0 9.792Z"
          />
        </g>
        <path
          fill={props.color || 'currentColor'}
          d="M5.497 2.632c-2.102 0-3.806 1.766-3.806 3.945v2.776h7.611V6.577c0-2.18-1.704-3.945-3.805-3.945ZM.846 6.577c0-2.663 2.082-4.822 4.65-4.822 2.57 0 4.652 2.159 4.652 4.822V9.79a.43.43 0 0 1-.423.439H1.269a.43.43 0 0 1-.423-.439V6.577Z"
        />
        <path
          fill={props.color || 'currentColor'}
          d="M3.523 6.139c.113 0 .22.046.3.128.079.083.123.194.123.31v1.17a.43.43 0 0 1-.423.437.43.43 0 0 1-.422-.438V6.577a.43.43 0 0 1 .422-.438Zm.423-4.53c0-.888.694-1.607 1.55-1.607.857 0 1.551.72 1.551 1.607v.585h-.846v-.585a.718.718 0 0 0-.704-.73.718.718 0 0 0-.705.73v.585h-.846v-.585Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h11v12H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Cook)
export default Icon // 在这里用！
