import type { SvgIconProps } from '@/components/Icon/types.ts'
import withIconColor from '@/components/Icon/withIconColor.tsx'

const Clear = (props: SvgIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      width={props.size}
      height={props.size}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fill={props.color || 'currentColor'}
        d="M8.081 1.6c-3.524 0-6.39 2.863-6.39 6.382 0 3.52 2.866 6.384 6.39 6.384 3.524 0 6.391-2.863 6.391-6.382 0-3.52-2.867-6.384-6.39-6.384Zm2.702 7.813a.9.9 0 0 1 0 1.269.902.902 0 0 1-1.27 0L8.08 9.252l-1.43 1.43a.902.902 0 0 1-1.272 0 .9.9 0 0 1 0-1.27L6.81 7.985l-1.43-1.43a.9.9 0 0 1 0-1.269.902.902 0 0 1 1.27 0l1.431 1.43 1.431-1.43a.902.902 0 0 1 1.271 0 .9.9 0 0 1 0 1.27L9.352 7.983l1.431 1.429Z"
      />
    </svg>
  )
}

const Icon = withIconColor(Clear)
export default Icon // 在这里用！
