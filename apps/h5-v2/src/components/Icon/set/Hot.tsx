import withIconColor from '../withIconColor'
import type { FontIconProps } from '../types'

const Hot = (props: FontIconProps) => {
  return (
    <div
      className={'inline-flex items-center justify-center leading-[1]'}
      style={{ width: props.size + 'px', height: props.size + 'px', fontSize: props.size + 'px' }}
      {...props}
    >
      <span>🔥</span>
    </div>
  )
}

const Icon = withIconColor(Hot)
export default Icon // 在这里用！
