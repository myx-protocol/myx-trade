import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { QuickActivateEntry } from './QuickActivateEntry'

interface ProgressSectionProps {
  show: boolean
  progressPercent: number
  progressDisplayCurrent: string
  progressTotalDisplay: string
  canShowQuickActivateEntry: boolean
  onOpenQuickActivate: () => void
}

export const ProgressSection = ({
  show,
  progressPercent,
  progressDisplayCurrent,
  progressTotalDisplay,
  canShowQuickActivateEntry,
  onOpenQuickActivate,
}: ProgressSectionProps) => {
  if (!show) return null

  return (
    <Box className="flex flex-col gap-[12px] p-[4px]">
      <Box className="relative">
        <Box className="h-[8px] w-full overflow-hidden rounded-[8px] bg-[#2D3138]">
          <Box
            className="h-full rounded-[8px] bg-[#00E3A5]"
            style={{ width: `${progressPercent}%` }}
          />
        </Box>
        {canShowQuickActivateEntry && (
          <Box className="absolute top-[50%] right-0 z-[1] translate-y-[-50%]">
            <QuickActivateEntry onClick={onOpenQuickActivate} />
          </Box>
        )}
      </Box>
      <Box className="flex items-center justify-between text-[14px] leading-none">
        <span className="text-[#848E9C]">
          <Trans>募集进度</Trans>
        </span>
        <Box className="text-white">
          <span>${progressDisplayCurrent}</span>
          <span className="text-[#848E9C]"> /${progressTotalDisplay}</span>
        </Box>
      </Box>
    </Box>
  )
}
