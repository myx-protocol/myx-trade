import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Trade = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 17 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill={props.color || 'currentColor'} clipPath="url(#a)">
        <path d="M.19 4.48 5.615.114a.51.51 0 0 1 .83.399v2.859h4.545c1.544 0 5.112.215 5.719 4.489.03.217-.24.341-.385.177-.813-.913-1.772-1.602-3.66-1.602H6.442v2.81c0 .43-.497.666-.83.4L.19 5.274a.51.51 0 0 1 0-.794Z" />
        <path d="m16.523 13.52-5.424 4.366a.51.51 0 0 1-.83-.398v-2.86H5.723c-1.543 0-5.112-.215-5.719-4.488-.03-.217.241-.342.386-.178.812.913 1.771 1.603 3.658 1.603h6.223v-2.81a.51.51 0 0 1 .83-.398l5.423 4.366a.514.514 0 0 1-.002.797Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h16.713v18H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Trade)
export default Icon
