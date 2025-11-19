import { Trans } from '@lingui/react/macro'
import { InputBase } from '@mui/material'
import { t } from '@lingui/core/macro'
import { PrimaryButton } from '../UI/Button'
import { useState } from 'react'

export const EmailForm = () => {
  const [email, setEmail] = useState('')

  return (
    <div className="mt-[28px]">
      <p className="text-[14px] font-[500] text-[white]">
        <Trans>Email login</Trans>
      </p>
      <div className="mt-[10px] flex w-full items-center gap-[8px] rounded-[6px] border border-[#3A404A] p-[4px]">
        <InputBase
          className="flex-1"
          sx={{
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '12px',
              px: '12px',
            },
          }}
          placeholder={t`Enter your email`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <PrimaryButton
        className="h-[44px] w-full"
        style={{ marginTop: '24px', borderRadius: '44px' }}
        onClick={() => {}}
      >
        <Trans>Next</Trans>
      </PrimaryButton>
    </div>
  )
}
