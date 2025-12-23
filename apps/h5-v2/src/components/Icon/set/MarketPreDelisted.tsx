import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const MarketPreDelisted = (props: SvgIconProps) => {
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
        fill="#EC605A"
        d="M3.042 10.4A1.044 1.044 0 0 1 2 9.36V3.04C2 2.469 2.468 2 3.042 2h6.317c.573 0 1.041.468 1.041 1.04v6.32c0 .572-.468 1.04-1.041 1.04H3.042Zm0-7.722c-.2 0-.363.163-.363.363v6.318c0 .2.163.363.363.363h6.317c.2 0 .363-.163.363-.363V3.041c0-.2-.163-.363-.363-.363H3.042Z"
      />
      <path
        fill="#EC605A"
        d="M6.279 3.748c-.34 0-1.018.005-1.367.005h-.083c-.287 0-.329.175-.329.329 0 .082.01.205.114.277.072.052.154.052.215.052h1.45c.19 0 .195.18.195.18.005.935 0 2.363 0 3.041l-.94-.935c-.078-.082-.15-.16-.268-.16-.118 0-.2.073-.303.186-.093.128-.088.267.01.38L6.51 8.639c.077.093.18.15.288.15.077 0 .185-.027.293-.15.622-.704 1.306-1.48 1.357-1.53.087-.068.113-.18.072-.294a.394.394 0 0 0-.355-.246.397.397 0 0 0-.267.113l-.766.899V4.59c.005-.55-.293-.843-.853-.843Z"
      />
    </svg>
  )
}

const Icon = withIconColor(MarketPreDelisted)
export default Icon // 在这里用！
