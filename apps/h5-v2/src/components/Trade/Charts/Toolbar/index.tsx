import { KlineStudy } from './KlineStudy'
import { KlineType } from './KlineType'
import { Operation } from './Operation'
import { Resolution } from './Resolution'

export const Toolbar = () => {
  return (
    <div className="flex items-center justify-between px-[16px] pt-[16px]">
      {/* left */}
      <div className="flex items-center justify-start gap-[15px]">
        <Resolution />
        <KlineType />
        <KlineStudy />
      </div>
      {/* right */}
      <Operation />
    </div>
  )
}
