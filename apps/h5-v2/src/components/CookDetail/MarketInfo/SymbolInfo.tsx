import { PairLogo } from '@/components/UI/PairLogo'
import Dropdown from '@/components/Icon/set/Dropdown'
import { usePoolContext } from '@/pages/Cook/hook'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy.tsx'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { SearchTypeEnum } from '@myx-trade/sdk'

export const SymbolInfo = () => {
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const { baseLpDetail, pool, chainId } = usePoolContext()
  return (
    <div className="flex leading-[1]">
      <PairLogo
        baseLogoSize={32}
        quoteLogoSize={12}
        baseLogo={baseLpDetail?.tokenIcon}
        quoteLogo={CHAIN_INFO?.[+chainId]?.logoUrl}
        baseSymbol={baseLpDetail?.symbolName}
      />
      <div className="pl-[4px]">
        {/* top */}
        <div className="flex items-center">
          <p className="text-[16px] font-bold text-white">
            {baseLpDetail?.mBaseQuoteSymbol || '--'}
          </p>
          <p className="ml-[4px] text-[14px] font-normal text-[#848E9C]">
            {baseLpDetail?.symbolName}
          </p>
          <div
            className="ml-[4px] flex"
            role="button"
            onClick={() => {
              openGlobalSearch({
                defaultTab: SearchTypeEnum.Cook,
              })
            }}
          >
            <Dropdown size={10} color="#fff" />
          </div>
        </div>
        {/* bottom */}
        <div className="text-secondary mt-[2px] flex items-center gap-[4px]">
          {/* address */}
          <div className="text-[12px] font-normal">
            {encryptionAddress(baseLpDetail?.baseToken)}
          </div>
          <Copy content={baseLpDetail?.baseToken || ''} />
        </div>
      </div>
    </div>
  )
}
