import usdc from '@/assets/icon/chainIcon/usdc.svg'
import usdt from '@/assets/icon/chainIcon/usdt.svg'

const ASSETS = {
  USDC: usdc,
  USDT: usdt,
}

export const getAssetIcon = (asset: string) => {
  return ASSETS?.[asset as keyof typeof ASSETS] || ''
}
