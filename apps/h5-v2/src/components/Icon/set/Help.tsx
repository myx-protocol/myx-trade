import withIconColor from '../withIconColor'
import type { SvgIconProps } from '../types'

const Help = (props: SvgIconProps) => {
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
        fill="#6D7180"
        d="M7 .873a6.122 6.122 0 0 1 6.125 6.12c0 3.379-2.742 6.119-6.125 6.119a6.122 6.122 0 0 1-6.125-6.12C.875 3.612 3.617.873 7 .873Zm.854 4.549h-.065c-.582.226-1.457.129-2.04.355v.162c.842 0 .615.518.453 1.133-.194.744-.583 1.714-.648 2.395-.065.68.356.938.778.938.583 0 1.069-.582 1.328-.906.065-.065.55-.582.259-.647-.26-.061-.518.97-1.004.777-.022 0-.043-.011-.065-.033.13-1.456.712-2.753 1.004-4.174Zm-.26-2.137a.713.713 0 1 0 0 1.427.713.713 0 0 0 0-1.427Z"
      />
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h14v14H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

const Icon = withIconColor(Help)
export default Icon // 在这里用！
