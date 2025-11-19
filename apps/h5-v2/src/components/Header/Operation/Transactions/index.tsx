import { Trans } from '@lingui/react/macro'
import { TransactionsDialog } from './TransactionsDialog'
import PendingTxPng from '@/assets/images/header/pending-tx.png'
import { useState } from 'react'
import { motion } from 'framer-motion'

// 模拟静态数据
const mockPendingTransactionsLength = 0

export const Transactions = () => {
  const [pendingTransactionsLength] = useState(mockPendingTransactionsLength)
  const [open, setOpen] = useState(false)

  return (
    <>
      {pendingTransactionsLength > 0 && (
        <div
          className="t flex cursor-pointer items-center gap-[4px] rounded-[6px] bg-[#18191F] p-[8px]"
          onClick={() => setOpen(true)}
        >
          <motion.img
            src={PendingTxPng}
            className="flex h-[12px] w-[12px]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <span className="text-[12px] leading-[12px] font-medium text-[#F29D39]">
            <Trans>{pendingTransactionsLength} 笔交易正在确认</Trans>
          </span>
        </div>
      )}

      <TransactionsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
