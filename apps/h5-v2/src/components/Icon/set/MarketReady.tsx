import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const MarketReady = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      {...props}
    >
      <mask
        id="a"
        width={8}
        height={8}
        x={2}
        y={2}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'luminance',
        }}
      >
        <path fill="#fff" d="M10 2H2v8h8V2Z" />
      </mask>
      <g mask="url(#a)">
        <path
          fill="#00E3A5"
          d="M5.047 8.848v.634c0 .28-.227.507-.508.507H2.508A.508.508 0 0 1 2 9.481V7.453c0-.28.227-.508.508-.508h.656V4.743A1.395 1.395 0 0 1 3.504 2a1.395 1.395 0 0 1 .422 2.731v2.214h.613c.28 0 .508.227.508.508v.633h2.474c.35.01.599-.023.738-.081.067-.029.067-.029.067-.045V6.792a1.395 1.395 0 0 1 .168-2.757 1.394 1.394 0 0 1 .594 2.698V7.96c0 .657-.599.911-1.575.888H5.047ZM3.523 4.03a.634.634 0 1 0 .001-1.27.634.634 0 0 0 0 1.27Zm-.761 3.677v1.521h1.523V7.707H2.762Zm5.84-1.648a.635.635 0 1 0 0-1.27.635.635 0 0 0 0 1.27Z"
        />
      </g>
    </svg>
  )
}

const Icon = withIconColor(MarketReady)
export default Icon // 在这里用！
