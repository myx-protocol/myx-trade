import { CopyIcon } from '@/components/Icon'
import { Box } from '@mui/material'
import type { MouseEventHandler } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from './UI/Toast'
import { t } from '@lingui/core/macro'
import { useThrottleFn } from 'ahooks'

export const Copy = ({ content, className = '' }: { content?: string; className?: string }) => {
  const [, copy] = useCopyToClipboard()

  const { run: onCopyFn } = useThrottleFn(
    (text: string) => {
      copy(text)
        .then((rs) => rs)
        .finally(() => {
          toast.success({
            title: t`Copy success`,
          })
        })
    },
    { wait: 1000 },
  )
  const onCopy: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (content) {
      onCopyFn(content)
    }
  }
  return (
    <Box className={`h-[12px] w-[12px] cursor-pointer ${className}`} onClick={onCopy}>
      <CopyIcon size={12} />
    </Box>
  )
}
