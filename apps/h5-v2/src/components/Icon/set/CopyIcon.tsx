import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const CopyIcon = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 12 12"
      fill="none"
    >
      <g clipPath="url(#a)">
        <mask
          id="b"
          width={12}
          height={12}
          x={0}
          y={0}
          maskUnits="userSpaceOnUse"
          style={{
            maskType: 'luminance',
          }}
        >
          <path fill={props.color || 'currentColor'} d="M12 0H0v12h12V0Z" />
        </mask>
        <g fill={props.color || 'currentColor'} mask="url(#b)">
          <path d="M10.098 9.24a.634.634 0 0 1-.636-.632c0-.35.284-.632.636-.632a.606.606 0 0 0 .615-.611v-5.48a.613.613 0 0 0-.615-.611H4.583a.61.61 0 0 0-.615.611c0 .35-.286.632-.637.632a.634.634 0 0 1-.636-.632A1.886 1.886 0 0 1 4.583.01h5.515a1.886 1.886 0 0 1 1.888 1.876v5.479a1.886 1.886 0 0 1-1.888 1.876Z" />
          <path d="M7.276 11.982H1.994c-.529 0-1.036-.208-1.41-.58A1.972 1.972 0 0 1 0 10V4.732c0-.526.209-1.03.583-1.402.374-.372.882-.58 1.411-.58h5.282c.53 0 1.037.208 1.41.58.375.371.585.875.584 1.401V10c.021 1.096-.89 1.982-1.994 1.982ZM1.994 4.015a.717.717 0 0 0-.721.716V10a.708.708 0 0 0 .21.508c.135.135.32.21.511.209h5.282a.72.72 0 0 0 .512-.209.71.71 0 0 0 .21-.508V4.73a.708.708 0 0 0-.21-.508.718.718 0 0 0-.512-.209H1.994Z" />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <path fill={props.color || 'currentColor'} d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(CopyIcon)
export default Icon // 在这里用！
