import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const CheckBoxIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M10 0C11.1046 1.28851e-07 12 0.895431 12 2V10C12 11.1046 11.1046 12 10 12H2C0.895431 12 3.22133e-08 11.1046 0 10V2C1.28853e-07 0.895431 0.895431 3.22128e-08 2 0H10ZM8.91895 4.19043C8.68164 3.95927 8.30155 3.964 8.07031 4.20117L5.44238 6.89844L3.86621 5.68457L3.7627 5.62012C3.51196 5.49779 3.20125 5.56426 3.02441 5.79395C2.84784 6.02367 2.86347 6.34075 3.0459 6.55176L3.13379 6.63574L5.13379 8.1748C5.37493 8.36028 5.71729 8.33596 5.92969 8.11816L8.92969 5.03906C9.16077 4.80184 9.15588 4.42169 8.91895 4.19043Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(CheckBoxIcon)
export default Icon // 在这里用！
