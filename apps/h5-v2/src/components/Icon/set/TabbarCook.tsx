import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const TabbarCook = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 20 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        d="M6.87 4.07V1.615c0-.338.28-.614.624-.614.343 0 .624.276.624.614v2.457a.621.621 0 0 1-.624.614.621.621 0 0 1-.624-.614Zm3.122.615a.621.621 0 0 0 .624-.614V1.614A.621.621 0 0 0 9.992 1a.621.621 0 0 0-.625.614v2.457c0 .337.281.614.625.614Zm2.497 0a.621.621 0 0 0 .624-.614V1.614A.621.621 0 0 0 12.49 1a.621.621 0 0 0-.624.614v2.457c0 .337.28.614.624.614Zm7.369 2.702a.631.631 0 0 0-.875-.123L17.485 8.37V7.14c0-.675-.562-1.228-1.25-1.228H3.748c-.686 0-1.248.553-1.248 1.228V8.37L1 7.264a.631.631 0 0 0-.874.123.607.607 0 0 0 .125.86l2.248 1.658v4.606c.007 1.359 1.116 2.449 2.497 2.456h9.991c1.382-.007 2.49-1.097 2.498-2.456V9.905l2.248-1.658a.607.607 0 0 0 .125-.86Z"
      />
    </svg>
  )
}

const Icon = withIconColor(TabbarCook)
export default Icon
