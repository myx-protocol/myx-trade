import { Trans } from '@lingui/react/macro'
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { SuccessIcon, PendingIcon, WrongIcon, NoData } from '@/components/UI/Icon/index'

// 模拟交易状态枚举
enum TransactionState {
  WRONG = 'WRONG',
  Finalized = 'Finalized',
  PENDING = 'PENDING',
  TIMEOUT = 'TIMEOUT',
}

// 模拟交易类型
enum TransactionType {
  SWAP = 'SWAP',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
}

// 模拟交易数据接口
interface MockTransaction {
  hash: string
  state: TransactionState
  info: {
    type: TransactionType
  }
}

const TRANSACTION_STATE_ICONS: Record<TransactionState, React.ReactNode> = {
  [TransactionState.WRONG]: <WrongIcon w={16} h={16} />,
  [TransactionState.Finalized]: <SuccessIcon w={16} h={16} />,
  [TransactionState.PENDING]: <PendingIcon w={16} h={16} />,
  [TransactionState.TIMEOUT]: <WrongIcon w={16} h={16} />,
}

const TRANSACTION_TYPES = {
  [TransactionType.SWAP]: { label: 'Swap' },
  [TransactionType.ADD_LIQUIDITY]: { label: 'Add Liquidity' },
  [TransactionType.REMOVE_LIQUIDITY]: { label: 'Remove Liquidity' },
}

const MAX_RENDER_LENGTH = 5

// 模拟静态交易数据
const mockTransactions: MockTransaction[] = [
  {
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    state: TransactionState.PENDING,
    info: { type: TransactionType.SWAP },
  },
  {
    hash: '0xabcdef1234567890abcdef1234567890abcdef12',
    state: TransactionState.Finalized,
    info: { type: TransactionType.ADD_LIQUIDITY },
  },
  {
    hash: '0x567890abcdef1234567890abcdef1234567890ab',
    state: TransactionState.WRONG,
    info: { type: TransactionType.REMOVE_LIQUIDITY },
  },
]

type TransactionsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TransactionsDialog = ({ open, onOpenChange }: TransactionsDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onOpenChange}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '390px',
          backgroundColor: '#18191F',
          border: '1px solid #31333D',
          borderRadius: '8px',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-600 p-4">
        <span className="text-lg font-medium text-white">
          <Trans>On-Chain Transaction History</Trans>
        </span>
        <IconButton
          onClick={() => onOpenChange(false)}
          className="text-gray-400 hover:text-white"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <TransactionsDialogContent />
    </Dialog>
  )
}

export function TransactionsDialogContent() {
  const renderTransactionsList = mockTransactions.slice(0, MAX_RENDER_LENGTH)

  return (
    <DialogContent className="p-0">
      {/* 表头 */}
      <div className="flex w-full border-b border-gray-600 px-4 py-2 text-sm text-gray-400">
        <div className="w-6 text-center">
          <Trans>状态</Trans>
        </div>
        <div className="ml-20 w-20">
          <Trans>类型</Trans>
        </div>
        <div className="ml-10 flex-1">
          <Trans>哈希</Trans>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="max-h-96 overflow-y-auto">
        {renderTransactionsList.length > 0 ? (
          <>
            {renderTransactionsList.map((transaction, _index) => (
              <div
                key={transaction.hash}
                className="relative flex h-12 items-center border-b border-gray-700 px-4 last:border-b-0"
              >
                {/* 状态图标 */}
                <div className="w-6 text-center">{TRANSACTION_STATE_ICONS[transaction.state]}</div>

                {/* 交易类型 */}
                <div className="ml-20 w-20 text-sm text-white">
                  {TRANSACTION_TYPES[transaction.info.type].label}
                </div>

                {/* 交易哈希 */}
                <div className="ml-10 flex-1 cursor-pointer text-sm text-blue-400 underline hover:text-blue-300">
                  {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-8)}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex min-h-[150px] items-center justify-center">
            <div className="flex flex-col items-center">
              <NoData width={80} height={80} />
              <p className="mt-3 text-sm text-gray-400">
                <Trans>No data</Trans>
              </p>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}
