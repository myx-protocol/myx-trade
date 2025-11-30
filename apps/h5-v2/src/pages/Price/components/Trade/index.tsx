import { OpenLong } from './OpenLong'
import { OpenShort } from './OpenShort'
import { TradeForm } from './TradeForm'

export const Trade = () => {
  return (
    <div className="mt-[12px] px-[16px]">
      <TradeForm />
      <div className="mt-[20px] flex justify-between gap-[10px]">
        <div className="flex-[1_1_0%]">
          <OpenLong />
        </div>
        <div className="flex-[1_1_0%]">
          <OpenShort />
        </div>
      </div>
    </div>
  )
}
