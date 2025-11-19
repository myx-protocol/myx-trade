import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const ChartLine = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M1.28886 11.7718H14.6374V12.8662H1.28886V11.7718ZM13.9624 4.0973H11.2258V3H14.8887L13.9624 4.0973Z"
        fill="currentColor"
      />
      <path
        d="M1.68552 9.94578L0.888672 9.14006L6.8686 4.02136L9.51416 7.56883L13.0436 3.4199L13.9656 4.0982L9.44982 9.4102L6.67009 5.67677L1.68405 9.94662L1.68552 9.94578Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(ChartLine)
export default Icon // 在这里用！
