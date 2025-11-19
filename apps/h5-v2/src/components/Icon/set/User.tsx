import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const User = (props: SvgIconProps) => {
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
        d="M6.62723 8.73008C4.07558 8.73008 2 10.8161 2 13.3823V13.6588C2 15 4.0424 15 6.62723 15H9.37277C11.8562 15 14 15 14 13.6588V13.3823C14 10.8174 11.9244 8.73008 9.37277 8.73008H6.62655H6.62723ZM7.86237 8.37444C9.88337 8.37444 11.527 6.721 11.527 4.68765C11.527 2.6543 9.88337 1 7.86304 1C5.84272 1 4.19771 2.65413 4.19771 4.68765C4.19771 6.72117 5.84204 8.37444 7.86304 8.37444H7.86237Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(User)
export default Icon // 在这里用！
