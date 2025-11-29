import { useContext } from 'react'
import type { ChainId } from '@/config/chain.ts'
import { CookContext } from '@/pages/Cook/context.ts'
import { CookListType } from '@/pages/Cook/type.ts'
import { Sniper } from '@/pages/Cook/components/Sniper.tsx'
import { New } from '@/pages/Cook/components/New.tsx'
import { Soon } from '@/pages/Cook/components/Soon.tsx'

export const CookTabs = ({ chainId }: { chainId?: ChainId }) => {
  const { cookType } = useContext(CookContext)
  if (cookType === CookListType.Sniper) {
    return <Sniper chainId={chainId} />
  }
  if (cookType === CookListType.New) {
    return <New chainId={chainId} />
  }
  if (cookType === CookListType.Soon) {
    return <Soon chainId={chainId} />
  }
  return <></>
}
