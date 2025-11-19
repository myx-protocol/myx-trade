import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const Next = (props: SvgIconProps) => {
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
        d="M8.22039 0.813925C8.01537 0.6089 7.68295 0.6089 7.47793 0.813925C7.2729 1.01895 7.2729 1.35136 7.47793 1.55639L11.3756 5.45404H1.31211C1.02216 5.45404 0.787109 5.68909 0.787109 5.97904C0.787109 6.26899 1.02216 6.50404 1.31211 6.50404H11.3756L7.47793 10.4017C7.2729 10.6067 7.2729 10.9391 7.47793 11.1442C7.68295 11.3492 8.01537 11.3492 8.22039 11.1442L12.9524 6.41214C13.1916 6.17295 13.1916 5.78514 12.9524 5.54594L8.22039 0.813925Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(Next)
export default Icon // 在这里用！
