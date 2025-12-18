import { CopyIcon } from '@/components/Icon'
import { Box } from '@mui/material'
import { useState, type MouseEventHandler } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from './UI/Toast'
import { t } from '@lingui/core/macro'
import { useThrottleFn } from 'ahooks'
import Yes from './Icon/set/Yes'

export const Copy = ({ content, className = '' }: { content?: string; className?: string }) => {
  const [, copy] = useCopyToClipboard()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const { run: onCopyFn } = useThrottleFn(
    (text: string) => {
      copy(text)
        .then((rs) => rs)
        .finally(() => {
          toast.success({
            title: t`Copy success`,
          })
          setTimeout(() => {
            setIsCopied(false)
          }, 1000)
          setIsCopied(true)
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
    <Box className={`h-[12px] w-[12px] cursor-pointer ${className}`}>
      {isCopied ? (
        <div
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <Yes size={12} color="#00E3A5" />
        </div>
      ) : (
        <div onClick={onCopy}>
          <CopyIcon size={12} />
        </div>
      )}
    </Box>
  )
}
