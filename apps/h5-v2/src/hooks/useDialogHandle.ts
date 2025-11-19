import { useCallback, useState } from 'react'

export const useDialogHandle = ({ onConfirm, onClose }: { onConfirm?: any; onClose?: any }) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const onCloseWrapper = useCallback(() => {
    onClose?.()
  }, [onClose])
  const onConfirmWrapper = useCallback(
    async (e: any) => {
      if (!onConfirm) return
      setLoading(true)
      try {
        await onConfirm(e)
        onCloseWrapper()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [onConfirm],
  )
  return {
    loading: isLoading,
    onConfirm: onConfirmWrapper,
    onClose: onCloseWrapper,
  }
}
