import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Copy = (props: SvgIconProps) => {
  return (
    <svg width={props.size} height={props.size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#a)">
        <path
          fill={props.color || 'currentColor'}
          fillRule="evenodd"
          d="M9.813 9.178c0 .227.184.41.41.41.567 0 1.026-.458 1.026-1.024V1.78c0-.566-.459-1.024-1.025-1.024H3.436c-.567 0-1.026.458-1.026 1.024a.41.41 0 1 0 .82 0c0-.112.093-.205.206-.205h6.788c.112 0 .205.093.205.205v6.783a.206.206 0 0 1-.205.205.41.41 0 0 0-.41.41Zm-8.039 2.07h6.788c.567 0 1.026-.459 1.026-1.025V3.441c0-.566-.459-1.024-1.026-1.024H1.774C1.208 2.417.75 2.875.75 3.44v6.782c0 .566.459 1.025 1.025 1.025ZM1.57 3.44c0-.113.093-.205.205-.205h6.788c.113 0 .206.092.206.205v6.782a.206.206 0 0 1-.206.205H1.774a.206.206 0 0 1-.205-.205V3.441Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Copy)
export default Icon // 在这里用！
