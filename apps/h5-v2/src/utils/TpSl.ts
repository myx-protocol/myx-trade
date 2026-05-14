import { TpSlTypeEnum } from '@/components/Trade/type.ts'
import Big from 'big.js'

/*
 * 价格（USD）
 *** 触发价格 = 用户输入价格
 * 收益率（ROI） 或 涨跌幅（Change）
 *** 触发价格 = 成本价 × （1 + 用户输入值 ÷ 100）
 * 盈亏金额（PnL）
 *** 触发价格 = 成本价 + 用户输入盈亏金额 ÷ 本次生效数量
 */

export const parseTriggerPrice = ({
  type,
  value,
  currentPrice,
  amount,
}: {
  type: TpSlTypeEnum
  value: string
  currentPrice?: string
  amount?: string
}) => {
  if (!value) return ''
  switch (type) {
    case TpSlTypeEnum.PRICE:
      return value
    case TpSlTypeEnum.ROI:
    case TpSlTypeEnum.Change:
      if (!currentPrice) return ''
      return new Big(currentPrice).mul(new Big(1).plus(new Big(value).div(100))).toString()
    case TpSlTypeEnum.Pnl:
      if (!currentPrice || !amount) return ''
      return new Big(currentPrice).plus(new Big(value).div(amount)).toString()
  }
}
