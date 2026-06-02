import { Trans } from '@lingui/react/macro'
import type { ReactElement } from 'react'

export const CommonErrorMapping: Record<string, ReactElement> = {
  'contract runner does not support gas estimation': (
    <Trans>contract runner does not support gas estimation</Trans>
  ),
  'Upfront cost exceeds account balance (transaction up-front cost 0x7000000 exceeds transaction sender account balance 0x0)':
    <Trans>Upfront cost exceeds account balance</Trans>,
  UserRejectedRequestError: <Trans>User Rejected</Trans>,
  ACTION_REJECTED: <Trans>User Rejected</Trans>,
  'User Rejected': <Trans>User Rejected</Trans>,
}
