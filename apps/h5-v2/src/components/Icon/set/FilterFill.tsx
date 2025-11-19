import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const FilterFill = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 8 8"
      fill="none"
    >
      <path
        d="M7.9625 5.00005H5.6875V4H7.9625V5.00005ZM7.9625 7H5.6875V5.99995H7.9625V7Z"
        fill="currentColor"
      />
      <path
        d="M0.291462 0.5C0.0616896 0.500598 -0.0775067 0.754638 0.0462234 0.948607L2.33344 4.38972V7.20749C2.33344 7.37488 2.4705 7.49998 2.62541 7.49998C2.65925 7.49998 2.69394 7.49391 2.72812 7.48101L4.47692 6.83912C4.59108 6.79648 4.66679 6.68736 4.66679 6.56551V4.38972L6.95024 0.954076C7.07995 0.760107 6.94093 0.5 6.70791 0.5H0.291462Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(FilterFill)
export default Icon // 在这里用！
