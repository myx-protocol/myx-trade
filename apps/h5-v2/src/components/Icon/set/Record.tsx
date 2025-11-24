import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Record = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 16 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#a)">
        <path
          fill="#848E9C"
          d="M11.694 17.978c-2.373 0-4.304-1.985-4.304-4.425 0-2.44 1.93-4.424 4.304-4.424 2.374 0 4.304 1.985 4.304 4.424 0 2.44-1.93 4.425-4.304 4.425Zm-.866-3.342h3.586V12.85h-1.848v-2.47h-1.738v4.256ZM0 17.978V.012h9.276l5.245 5.392v2.658a5.912 5.912 0 0 0-2.828-.725c-.984 0-1.883.23-2.723.664a6.108 6.108 0 0 0-2.188 1.923 6.331 6.331 0 0 0-1.097 4.325 6.269 6.269 0 0 0 1.768 3.73H0v-.001Zm1.218-8.09h4.694V8.101H1.218v1.787Zm0-3.786H7.39V4.315H1.218v1.787Z"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h16v18H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Record)
export default Icon
