import { useState } from 'react'
import { Box, Stack, Typography, Divider } from '@mui/material'
import CopyFill from '@/components/Icon/set/Copy'
import TipsLine from '@/components/Icon/set/TipsOutLine'
import IncreaseLine from '@/components/Icon/set/Add'
import EditLine from '@/components/Icon/set/EditSimply'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { DefaultButton as Button } from '@/components/Button/DefaultButton'

import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from '@/components/UI/Toast'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Navigate } from 'react-router-dom'
import { encryptionAddress } from '@/utils'
import { useReferralStore } from '@/store/referrals'
import type { InvitationCodeInfo } from '@/store/referrals'
import { useEffect } from 'react'
import { SetDefaultConfirmDialog } from '../components/SelectReferral/SetDefaultConfirmDialog'
import { EditNoteDialog } from '../components/SelectReferral/EditNoteDialog'
import { RebateSettingDialog } from '../components/SelectReferral/RebateSettingDialog'
import { ReferralFriendsListMobileDialog } from './components/ReferralFriendsListDialog'
import { SecondHeader } from '@/components/SecondHeader'
import { PrimaryButton } from '@/components/UI/Button'

const FORMAT_VALUE_FALLBACK = '--'

export function MobileSelectReferral() {
  const { isConnected, setLoginModalOpen } = useWalletConnection()
  const [openRebateSetting, setOpenRebateSetting] = useState(false)

  if (!isConnected) {
    return <Navigate to="/referrals" replace />
  }

  return (
    <div>
      <SecondHeader title={<Trans>Select Referral</Trans>} />
      <Stack direction="column" px="20px" flex={1} height="100%">
        <Box flex={1} minHeight={0} maxHeight="100%" overflow="auto">
          <SelectReferralList />
        </Box>

        <Box py="20px">
          <PrimaryButton
            style={{
              height: '44px',
            }}
            onClick={() => {
              if (!isConnected) {
                setLoginModalOpen(true)
                return
              }
              setOpenRebateSetting(true)
            }}
            className="w-full"
          >
            + <Trans>Add New Referral</Trans>
          </PrimaryButton>

          <RebateSettingDialog
            open={openRebateSetting}
            onClose={() => setOpenRebateSetting(false)}
          />
        </Box>
      </Stack>
    </div>
  )
}

function SelectReferralItem({ info }: { info: InvitationCodeInfo }) {
  const [, copy] = useCopyToClipboard()
  const [openSetAsDefault, setOpenAsDefault] = useState(false)
  const [openReferralFriendsListDialog, setReferralFriendsListDialog] = useState(false)
  const [openEditNoteDialog, setEditNoteDialog] = useState(false)

  return (
    <Stack direction="column" gap="12px" py="16px">
      <Stack direction="row" justifyContent="space-between" gap="10px" alignItems="center">
        <Stack direction="row" gap="4px" alignItems="center">
          <Typography className="text-white" fontSize="14px" lineHeight={1} fontWeight="500">
            {info.invitationCode}
          </Typography>

          <Box
            component="span"
            sx={{ cursor: 'pointer', display: 'flex', color: 'white' }}
            onClick={() => {
              copy(info.invitationCode).then(
                (rs) => rs && toast.success({ title: t`Copy success` }),
              )
            }}
          >
            <CopyFill size={16} style={{ width: '16px', height: '16px' }} />
          </Box>
        </Stack>

        <Box>
          {info.isDefault ? (
            <Box
              bgcolor="rgba(255, 202, 64, 0.10)"
              color="#FFD700" // gold
              fontSize="12px"
              lineHeight={1}
              borderRadius="4px"
              fontWeight={500}
              p="4px 12px"
            >
              <Trans>Default</Trans>
            </Box>
          ) : (
            <>
              <Box
                component="span"
                sx={{ cursor: 'pointer' }}
                fontSize="14px"
                lineHeight={1}
                color="primary.main" // brand
                onClick={() => setOpenAsDefault(true)}
              >
                <Trans>Set as Default</Trans>
              </Box>

              <SetDefaultConfirmDialog
                info={info}
                open={openSetAsDefault}
                onClose={() => setOpenAsDefault(false)}
              />
            </>
          )}
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap="10px">
        <Box fontSize="12px" lineHeight={1} color="#848e9c">
          <Trans>You Receive</Trans> / <Trans>Friends Receive</Trans>
        </Box>

        <Box color="white" fontSize="12px" fontWeight="400" lineHeight={1}>
          {`${info.referrerRatio}%`} / {`${info.refereeRatio}%`}
        </Box>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap="10px" alignItems="center">
        <Box fontSize="12px" lineHeight={1} color="#848e9c">
          <Trans>Referral Link</Trans>
        </Box>

        <Stack
          direction="row"
          gap="4px"
          color="white"
          alignItems="center"
          fontSize="14px"
          fontWeight="400"
        >
          {info?.invitationLink
            ? encryptionAddress(info?.invitationLink, 10, 15)
            : FORMAT_VALUE_FALLBACK}

          <Box
            component="span"
            sx={{ cursor: 'pointer', display: 'flex' }}
            onClick={() => {
              copy(info.invitationLink).then(
                (rs) => rs && toast.success({ title: t`Copy success` }),
              )
            }}
          >
            <CopyFill size={14} style={{ fontSize: '14px', color: 'white' }} />
          </Box>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" gap="10px" alignItems="center">
        <Box fontSize="12px" lineHeight={1} color="#848e9c">
          <Trans>Friends</Trans>
        </Box>

        <Stack direction="row" gap="4px" color="white" alignItems="center">
          <Typography lineHeight={1} fontSize="14px" fontWeight="400">
            {info.referees}
          </Typography>

          <Box
            component="span"
            sx={{ cursor: 'pointer', display: 'flex' }}
            onClick={() => setReferralFriendsListDialog(true)}
          >
            <TipsLine size={16} style={{ fontSize: '16px', color: 'white' }} />
          </Box>

          <ReferralFriendsListMobileDialog
            open={openReferralFriendsListDialog}
            info={info}
            onClose={() => setReferralFriendsListDialog(false)}
          />
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" gap="10px">
        <Box fontSize="12px" lineHeight={1} color="#848e9c">
          <Trans>Note</Trans>
        </Box>

        <Stack direction="row" gap="4px" alignItems="center">
          <Typography color="text.primary" fontSize="12px" fontWeight="400" lineHeight={1}>
            {info.note || FORMAT_VALUE_FALLBACK}
          </Typography>

          <Box
            component="span"
            sx={{ cursor: 'pointer', display: 'flex' }}
            onClick={() => setEditNoteDialog(true)}
          >
            <EditLine size={16} style={{ fontSize: '16px', color: 'white' }} />
          </Box>

          <EditNoteDialog
            info={info}
            open={openEditNoteDialog}
            onClose={() => setEditNoteDialog(false)}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

function SelectReferralList() {
  const { invitationCodes, fetchInvitationCodes, accessToken } = useReferralStore()

  useEffect(() => {
    if (accessToken) {
      fetchInvitationCodes()
    }
  }, [accessToken, fetchInvitationCodes])

  return (
    <Stack direction="column">
      {invitationCodes.map((info: InvitationCodeInfo, index: number) => {
        return (
          <Box key={info.invitationCode}>
            <SelectReferralItem info={info} />
            {invitationCodes.length - 1 !== index && <div className="h-px bg-[#31333d]"></div>}
          </Box>
        )
      })}
    </Stack>
  )
}
