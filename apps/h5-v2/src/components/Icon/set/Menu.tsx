import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Menu = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width={4.6} height={4.6} fill={props.color || 'currentColor'} rx={2.3} />
      <rect width={4.6} height={4.6} x={8.7} fill={props.color || 'currentColor'} rx={2.3} />
      <rect width={4.6} height={4.6} x={17.4} fill={props.color || 'currentColor'} rx={2.3} />
      <rect width={4.6} height={4.6} y={8.699} fill={props.color || 'currentColor'} rx={2.3} />
      <rect
        width={4.6}
        height={4.6}
        x={8.7}
        y={8.699}
        fill={props.color || 'currentColor'}
        rx={2.3}
      />
      <rect
        width={4.6}
        height={4.6}
        x={17.4}
        y={8.699}
        fill={props.color || 'currentColor'}
        rx={2.3}
      />
      <rect width={4.6} height={4.6} y={17.4} fill={props.color || 'currentColor'} rx={2.3} />
      <rect
        width={4.6}
        height={4.6}
        x={8.7}
        y={17.4}
        fill={props.color || 'currentColor'}
        rx={2.3}
      />
      <rect
        width={4.6}
        height={4.6}
        x={17.4}
        y={17.4}
        fill={props.color || 'currentColor'}
        rx={2.3}
      />
    </svg>
  )
}

const Icon = withIconColor(Menu)
export default Icon
