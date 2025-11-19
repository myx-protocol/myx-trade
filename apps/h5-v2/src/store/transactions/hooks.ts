// import { useCallback, useMemo } from 'react'
// import { toast } from '@/components/ui/Toast'
// import { t } from '@lingui/core/macro'
// import { useTransactionsStore } from './createStore'
// import { TransactionState } from './types'
// import type { CurrentChainTransactionState } from './initialState'
// import type { TransactionType } from './options'
// import type { TransactionDetails, TransactionInfo } from './types'

// export function useTransactionAdder() {
//   const { addTransactionToStore } = useTransactionsStore((s) => ({ addTransactionToStore: s.addTransaction }))
//   const chainId = useAtomValue(walletChainIdAtom)
//   const store = useStore()
//   const addTransaction = useCallback(
//     (response: { hash?: string }, info: TransactionInfo, { showToast = true }: { showToast?: boolean } = {}) => {
//       const account = store.get(walletAccountAddressAtom)
//       if (!account) return
//       if (!chainId) return

//       const { hash } = response
//       if (!hash) {
//         throw new Error('No transaction hash found.')
//       }

//       addTransactionToStore({ chainId, hash, from: account, info })

//       if (showToast) {
//         toast.success(t`链上交易结果请在 【更多】-【链上交易】中查看`, { title: t`操作成功` })
//       }
//     },
//     [addTransactionToStore, store, chainId]
//   )

//   return { addTransaction }
// }

// export function useTransactionRemover() {
//   const { removeTransaction: removeTransactionOfStore } = useTransactionsStore()
//   const chainId = useAtomValue(walletChainIdAtom)
//   const store = useStore()

//   const removeTransaction = useCallback(
//     (hash: string) => {
//       const account = store.get(walletAccountAddressAtom)

//       if (!account) return
//       if (!chainId) return

//       removeTransactionOfStore({ hash, chainId, from: account })
//     },
//     [removeTransactionOfStore, store, chainId]
//   )

//   return { removeTransaction }
// }

// export function useAllTransactions() {
//   const account = useAtomValue(walletAccountAddressAtom)
//   const chainId = useAtomValue(walletChainIdAtom)

//   const { transactionsFromStore } = useTransactionsStore((s) => ({ transactionsFromStore: s.transactions }))
//   const allTransactions: CurrentChainTransactionState = useMemo(() => {
//     return account && chainId ? transactionsFromStore?.[account]?.[chainId] ?? {} : {}
//   }, [chainId, transactionsFromStore, account])

//   const allTransactionsList = useMemo(() => {
//     return Object.values(allTransactions).sort(newTransactionsFirst)
//   }, [allTransactions])

//   return { allTransactions, allTransactionsList }
// }

// export function isPendingTx(tx: TransactionDetails): boolean {
//   return tx.state === TransactionState.PENDING
// }

// export function usePendingTransactions() {
//   const { allTransactionsList } = useAllTransactions()

//   const pendingTransactionsList = useMemo(
//     () => allTransactionsList.filter((tx) => isPendingTx(tx)),
//     [allTransactionsList]
//   )

//   const pendingTransactions: CurrentChainTransactionState = useMemo(
//     () => pendingTransactionsList.reduce((acc, tx) => ({ ...acc, [tx.hash]: tx }), {}),
//     [pendingTransactionsList]
//   )

//   const pendingTransactionsLength = useMemo(() => pendingTransactionsList.length, [pendingTransactionsList])

//   return {
//     pendingTransactionsList,
//     pendingTransactions,
//     pendingTransactionsLength,
//   }
// }

// /**
//  * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
//  * @param tx to check for recency
//  */
// export function isTransactionRecent(tx: TransactionDetails): boolean {
//   return Date.now() - tx.addedTime < 86_400_000
// }

// // we want the latest one to come first, so return negative if a is after b
// function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
//   return b.addedTime - a.addedTime
// }

// export function useIsTransactionPending(txHash?: string) {
//   const { pendingTransactions } = usePendingTransactions()

//   const isTransactionPendingFn = useCallback(
//     (txHash?: string) => {
//       return txHash && pendingTransactions[txHash!] ? isPendingTx(pendingTransactions[txHash]) : false
//     },
//     [pendingTransactions]
//   )

//   const isTransactionPending = useMemo(() => {
//     return isTransactionPendingFn(txHash)
//   }, [isTransactionPendingFn, txHash])

//   return { isTransactionPending, isTransactionPendingFn }
// }

// export function useIsTransactionPendingByType(type: TransactionType): { isTransactionPending: boolean } {
//   const { pendingTransactionsList } = usePendingTransactions()

//   return { isTransactionPending: pendingTransactionsList.some((tx) => tx.info.type === type) }
// }
