import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const BackIcon = (props: SvgIconProps) => {
  return (
    <svg
      width={props.size}
      height={props.size}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.2741 3.22204C15.9728 2.92078 15.4844 2.92078 15.1831 3.22204L6.40904 11.9961L15.1831 20.7701C15.4844 21.0714 15.9728 21.0714 16.2741 20.7701C16.5753 20.4689 16.5753 19.9804 16.2741 19.6792L8.59096 11.9961L16.2741 4.313C16.5753 4.01174 16.5753 3.5233 16.2741 3.22204Z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = withIconColor(BackIcon)
export default Icon
