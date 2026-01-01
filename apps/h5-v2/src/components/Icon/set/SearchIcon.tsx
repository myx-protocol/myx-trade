import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const SearchIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 14 14"
      fill="none"
    >
      <g clipPath="url(#clip0_3948_90304)">
        <mask
          id="mask0_3948_90304"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={props.size}
          height={props.size}
        >
          <path d="M13.0003 0.5H0.00244141V14.5H13.0003V0.5Z" fill="white" />
        </mask>
        <g mask="url(#mask0_3948_90304)">
          <path
            d="M10.8286 10.7692L12.7753 13.0459C13.0917 13.4158 13.0426 13.9672 12.6657 14.2779C12.2887 14.5884 11.7266 14.5402 11.4102 14.1703L9.44753 11.8743C6.64322 13.5268 3.01418 12.7723 1.1338 10.1455C-0.746593 7.51885 -0.239645 3.9128 2.29544 1.88408C4.83053 -0.144632 8.53196 0.0934375 10.7755 2.42956C13.0191 4.76568 13.0423 8.40589 10.8285 10.7692H10.8286ZM6.23825 11.4344C8.94458 11.4344 11.1386 9.28132 11.1386 6.62567C11.1386 3.97001 8.94476 1.8168 6.23825 1.8168C3.53175 1.8168 1.33811 3.96984 1.33811 6.62567C1.33811 9.28149 3.53209 11.4344 6.23843 11.4344H6.23825Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3948_90304">
          <rect width={props.size} height={props.size} fill="white" transform="translate(0 0.5)" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(SearchIcon)
export default Icon // 在这里用！
