import { Icon } from '@/components/UI/Icon'

interface Props {
  size?: number
}

const PlusIcon = ({ size = 16 }: Props) => {
  return (
    <Icon width={size} height={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 3.33337V12.6667M3.33334 8H12.6667"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </Icon>
  )
}

export default PlusIcon
