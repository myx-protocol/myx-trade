import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const Prev = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.77961 1.81393C5.98463 1.6089 6.31705 1.6089 6.52207 1.81393C6.7271 2.01895 6.7271 2.35136 6.52207 2.55639L2.62442 6.45404H12.6879C12.9778 6.45404 13.2129 6.68909 13.2129 6.97904C13.2129 7.26899 12.9778 7.50404 12.6879 7.50404H2.62442L6.52207 11.4017C6.7271 11.6067 6.7271 11.9391 6.52207 12.1442C6.31705 12.3492 5.98463 12.3492 5.77961 12.1442L1.0476 7.41214C0.808401 7.17295 0.808396 6.78514 1.04759 6.54594L5.77961 1.81393Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(Prev)
export default Icon // 在这里用！
