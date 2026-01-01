import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'
const ChartBar = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 56 56"
      fill="none"
    >
      <g clipPath="url(#clip0_5098_33797)">
        <path
          d="M2.36919 55.9309C1.06678 55.9309 0 54.874 0 53.5639C0.00819552 52.2511 1.06405 51.1846 2.37807 51.1621H53.5885C54.8909 51.1621 55.9577 52.2279 55.9577 53.5291C55.9488 54.8392 54.8909 55.9132 53.5885 55.9309H2.36919Z"
          fill="currentColor"
        />
        <path
          d="M40.8246 43.5301C40.8335 44.3858 41.5499 45.0845 42.407 45.0845H50.2836C51.1749 45.0845 51.9009 44.3946 51.9009 43.5383V1.8395C51.9009 0.98386 51.1749 0.285156 50.2836 0.285156H42.4419C41.5499 0.285156 40.8246 0.983177 40.8246 1.8395V43.5301Z"
          fill="currentColor"
        />
        <path
          d="M21.2073 43.5301C21.2161 44.3858 21.9333 45.0845 22.7897 45.0845L30.6663 45.0851C31.5582 45.0851 32.2835 44.3953 32.2835 43.539V12.582C32.2835 11.7345 31.5582 11.0358 30.6663 11.0358H22.8245C21.9333 11.0358 21.2073 11.7345 21.2073 12.582V43.5301Z"
          fill="currentColor"
        />
        <path
          d="M1.59061 43.5301C1.59949 44.3858 2.31659 45.0845 3.17303 45.0845L11.0489 45.0851C11.9409 45.0851 12.6662 44.3953 12.6662 43.539V24.4734C12.6662 23.6171 11.9409 22.9184 11.0489 22.9184H3.19898C2.31591 22.9184 1.59061 23.6089 1.59061 24.4645V43.5301Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_5098_33797">
          <rect width="56" height="56" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(ChartBar)
export default Icon // 在这里用！
