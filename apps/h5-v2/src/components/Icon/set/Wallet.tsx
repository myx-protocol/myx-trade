import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Wallet = (props: SvgIconProps) => {
  return (
    <svg
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M7.954.99a1.494 1.494 0 0 1 1.951.794l.426 1.014h1.305c.82 0 1.488.669 1.489 1.49v6.592a1.493 1.493 0 0 1-1.49 1.49h-9.27a1.493 1.493 0 0 1-1.49-1.491v-6.59c.001-.821.669-1.49 1.49-1.491h1.29l4.3-1.809Zm-5.59 2.536a.764.764 0 0 0-.76.762v6.592c0 .419.341.76.76.76h9.272c.419 0 .76-.341.76-.76V9.379H8.482a.647.647 0 0 1-.645-.646v-2.3c0-.355.29-.644.645-.645h3.915v-1.5a.763.763 0 0 0-.76-.762H2.364Zm6.2 2.99V8.65h3.832V6.517H8.564Zm1.188.421a.647.647 0 0 1 0 1.292.646.646 0 0 1 0-1.291Zm-.519-4.87a.762.762 0 0 0-.996-.406L5.533 2.798h4.008l-.308-.732Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Wallet)
export default Icon // 在这里用！
