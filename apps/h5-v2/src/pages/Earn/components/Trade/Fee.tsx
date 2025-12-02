import { DescribeItem } from '@/components/Describe.tsx'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'

export const Fee = () => {
  return (
    <DescribeItem
      title={
        <Tooltips title={t`Fees are permanently free.`}>
          <span
            className={
              'text-Secondary cursor-pointer text-[12px] leading-[1] underline decoration-dashed underline-offset-2'
            }
          >
            <Trans>Fee</Trans>
          </span>
        </Tooltips>
      }
      className={'h-[18px]'}
    >
      <Box
        className={
          'bg-brand-10 text-green border-green flex rounded-[20px] border-[0.5px] px-[8px] py-[3px] text-[10px] leading-[1]'
        }
      >
        <Trans>Free forever</Trans>
      </Box>
    </DescribeItem>
  )
}
