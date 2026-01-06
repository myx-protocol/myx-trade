import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const KlineIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <g clipPath="url(#a)">
        <mask
          id="b"
          width={18}
          height={20}
          x={0}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: 'luminance',
          }}
        >
          <path fill="#fff" d="M18 0H0v20h18V0Z" />
        </mask>
        <g mask="url(#b)">
          <path
            fill="#fff"
            d="M7.579 3.813H4.744V.502s-.015-.49-.488-.49h-.452s-.48.022-.48.49v3.303H.495S0 3.798 0 4.295v11.396s.104.476.481.476h2.842v3.326s.015.482.481.482h.466s.474-.015.474-.482v-3.319l2.835-.007s.474 0 .474-.476V4.295s0-.482-.474-.482Zm9.947 1.9h-2.36v-3.31s-.016-.49-.49-.49h-.45s-.482.022-.482.49v3.303h-2.353s-.496-.007-.496.49v5.694s.104.475.48.475h2.37v2.376s.014.482.48.482h.467s.473-.014.473-.482v-2.368l2.361-.008s.474 0 .474-.475V6.196s0-.482-.474-.482Z"
          />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h18v20H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(KlineIcon)
export default Icon // 在这里用！
