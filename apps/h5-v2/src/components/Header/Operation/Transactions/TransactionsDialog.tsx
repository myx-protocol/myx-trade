import { Trans } from '@lingui/react/macro'
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import {
  NoData,
  ChainPriceErrorIcon,
  ChainPriceSuccessIcon,
  PendingIcon,
} from '@/components/UI/Icon/index'
import { t } from '@lingui/core/macro'
import { PoolTxType, PoolTxState, usePoolTxRecordsStore } from '@/store/poolTxRecords'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { ChainId } from '@myx-trade/sdk'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import { toast } from '@/components/UI/Toast'
import { DialogBase } from '@/components/UI/DialogBase'

const STATE_ICONS: Record<PoolTxState, React.ReactNode> = {
  [PoolTxState.Pending]: <PendingIcon color="#F29D39" w={16} h={16} />,
  [PoolTxState.Finalized]: <ChainPriceSuccessIcon w={16} h={16} />,
  [PoolTxState.Cancelled]: <ChainPriceErrorIcon w={16} h={16} />,
}

const getTransactionTypes = () => ({
  [PoolTxType.Adjust_Margin]: t`Adjust Margin`,
  [PoolTxType.DepositBase]: t`Deposit Base`,
  [PoolTxType.DepositQuote]: t`Deposit Quote`,
  [PoolTxType.WithdrawBase]: t`Withdraw Base`,
  [PoolTxType.WithdrawQuote]: t`Withdraw Quote`,
  [PoolTxType.ClaimBaseRewards]: t`Claim Base Rewards`,
  [PoolTxType.ClaimQuoteRewards]: t`Claim Quote Rewards`,
})

const PAGE_SIZE = 5

type TransactionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TransactionsDialog = ({ open, onOpenChange }: TransactionsDialogProps) => {
  return (
    <DialogBase
      open={open}
      title={t`On-Chain Transaction History`}
      onClose={() => onOpenChange(false)}
    >
      {/* <DialogTitle className="flex items-center justify-between p-4">
        <span className="text-lg font-medium text-white">
          <Trans>On-Chain Transaction History</Trans>
        </span>
        <IconButton onClick={() => onOpenChange(false)} size="small" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle> */}

      <TransactionsDialogContent />
    </DialogBase>
  )
}

export function TransactionsDialogContent() {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const localRecords = usePoolTxRecordsStore((s) => s.records)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [after, setAfter] = useState(0)
  const [before, setBefore] = useState(0)
  // txId -> timestamp when we first got a result (online or local createdAt)
  const firstSeenAtRef = useRef<Map<string, number>>(new Map())
  const [now, setNow] = useState(() => Date.now())

  const { data: onlineData, mutate } = useSWR(
    client && clientIsAuthenticated && address
      ? ['getTransactionOnline', address, after, before]
      : null,
    async () => {
      const accessToken = await client!.getAccessToken()
      const res = await client!.api.getTransactionOnline({
        accessToken: accessToken ?? '',
        address: address!,
        poolId: '',
        ...(after > 0 ? { after } : {}),
        ...(before > 0 ? { before } : {}),
        txId: '',
        limit: PAGE_SIZE,
      })
      return (res?.data ?? []) as any[]
    },
    { refreshInterval: 3000 },
  )

  const sortedLocal = [...localRecords].sort((a, b) => b.createdAt - a.createdAt)
  const pageRecords = sortedLocal
    .filter((r) => {
      if (after > 0 && r.createdAt >= after) return false
      if (before > 0 && r.createdAt <= before) return false
      return true
    })
    .slice(0, PAGE_SIZE)

  const onlineMap = new Map<string, any>((onlineData ?? []).map((item: any) => [item.txId, item]))
  const renderList = pageRecords.map((record) => {
    // 本地已是终态，不用接口数据覆盖
    const localFinalized = record.state !== PoolTxState.Pending
    const online = onlineMap.get(record.txId)
    return {
      ...record,
      state: localFinalized ? record.state : online ? online.state : record.state,
    }
  })

  // 记录每条记录首次出现的时间
  useEffect(() => {
    const t = Date.now()
    pageRecords.forEach((r) => {
      if (!firstSeenAtRef.current.has(r.txId)) {
        firstSeenAtRef.current.set(r.txId, t)
      }
    })
  })

  // 每秒更新 now，驱动 10s 倒计时
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hasPrev = after > 0 || before > 0
  const lastCreatedAt = pageRecords[pageRecords.length - 1]?.createdAt ?? 0
  const hasNext = lastCreatedAt > 0 && sortedLocal.some((r) => r.createdAt < lastCreatedAt)

  const handleNext = () => {
    const last = pageRecords[pageRecords.length - 1]
    if (!last) return
    setAfter(last.createdAt)
    setBefore(0)
  }

  const handlePrev = () => {
    const first = pageRecords[0]
    if (!first) return
    setBefore(first.createdAt)
    setAfter(0)
  }

  const handleCancel = async (record: (typeof renderList)[number]) => {
    if (!client || cancellingId) return
    setCancellingId(record.txId)
    try {
      await client.order.cancelPriceOrder({
        chainId: record.chainId as ChainId,
        txtId: record.txId as `0x${string}`,
      })
      mutate()
    } catch (e) {
      toast.error({ title: t`Cancel failed` })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="mt-[16px]">
      {renderList.length > 0 ? (
        <div>
          <div className="flex px-4 py-2 text-sm text-[#6D7180]">
            <div className="w-[50px]">
              <Trans>状态</Trans>
            </div>
            <div className="w-[100px]">
              <Trans>类型</Trans>
            </div>
            <div className="w-[150px]">
              <Trans>哈希</Trans>
            </div>
            <div className="flex-1 text-right">
              <Trans>操作</Trans>
            </div>
          </div>
          {renderList.map((record, index) => (
            <div
              key={record.txId}
              className={`flex items-center px-4 py-3 text-sm ${index !== 0 ? 'border-t border-[#31333D]' : ''}`}
            >
              <div className="w-[50px]">
                {STATE_ICONS[record.state as PoolTxState] ?? STATE_ICONS[PoolTxState.Pending]}
              </div>
              <div className="w-[100px] text-white">
                {getTransactionTypes()[record.type] ?? record.type}
              </div>
              <div className="w-[150px] cursor-pointer text-white">
                {record.txHash ? `${record.txHash.slice(0, 8)}...${record.txHash.slice(-8)}` : '--'}
              </div>
              <div className="flex-1 text-right">
                {record.state === PoolTxState.Pending ? (
                  (() => {
                    const firstSeen = firstSeenAtRef.current.get(record.txId) ?? now
                    const showCancel = now - firstSeen >= 10_000
                    return showCancel ? (
                      <div
                        className={`cursor-pointer text-[#00E3A5] ${cancellingId === record.txId ? 'pointer-events-none opacity-50' : ''}`}
                        onClick={() => handleCancel(record)}
                      >
                        <Trans>Cancel</Trans>
                      </div>
                    ) : (
                      <div className="text-[#6D7180]">--</div>
                    )
                  })()
                ) : (
                  <div className="text-[#6D7180]">--</div>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-end gap-[16px] border-t border-[#31333D] px-4 py-3">
            <button
              disabled={!hasPrev}
              onClick={handlePrev}
              className="flex items-center justify-center text-[#6D7180] enabled:cursor-pointer enabled:hover:text-white disabled:opacity-30"
            >
              <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
                <ArrowRight size={16} color="currentColor" />
              </span>
            </button>
            <button
              disabled={!hasNext}
              onClick={handleNext}
              className="flex items-center justify-center text-[#6D7180] enabled:cursor-pointer enabled:hover:text-white disabled:opacity-30"
            >
              <ArrowRight size={16} color="currentColor" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[150px] items-center justify-center">
          <div className="flex flex-col items-center">
            <p className="mt-3 text-sm text-[#6D7180]">
              <Trans>No data</Trans>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
