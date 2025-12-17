import { DialogContent, Slider } from '@mui/material'
import { useReferralStore, InvitationCodeFlag } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useState, useMemo } from 'react'
import { toast } from '@/components/UI/Toast'
import { formatNumberPercent } from '@/utils/formatNumber'
import TipsFill from '@/components/Icon/set/TipsFill'
import { z } from 'zod'
import { Tooltips } from '@/components/UI/Tooltips'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { CheckBox } from '@/components/UI/CheckBox'

export const RebateSettingDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { ratioInfo, createInvitationCode, fetchInvitationCodes, fetchRatioInfo } =
    useReferralStore()
  const accessParams = useAccessParams()
  const [confirming, setConfirming] = useState(false)
  const [ratioIndex, setRatioIndex] = useState(0)
  const [note, setNote] = useState('')
  const [flag, setFlag] = useState<InvitationCodeFlag>(InvitationCodeFlag.NON_DEFAULT)

  const ratioData = ratioInfo
  const optionsMaxLength = ratioData?.options.length ? ratioData?.options.length - 1 : 0
  const refereeRatio = ratioData?.options[ratioIndex]
  const referrerRatio = (ratioData?.maxRatio ?? 0) - (refereeRatio ?? 0)

  const marks = useMemo(() => {
    return ratioData?.options.map((_, i) => ({ value: i }))
  }, [ratioData?.options])

  const handleConfirm = async () => {
    try {
      setConfirming(true)
      const noteSchema = z.string().regex(/^[\w-]*$/, {
        message: t`Notes can only enter letters or numbers`,
      })
      noteSchema.parse(note)
      if (accessParams?.accessToken && accessParams.account) {
        await createInvitationCode({
          referrerRatio: Number(referrerRatio),
          refereeRatio: Number(refereeRatio),
          note: note,
          flag: flag,
        })
        await fetchInvitationCodes()
        await fetchRatioInfo()
        onClose()
        toast.success({ title: t`Created successfully` })
      }
    } catch (e: any) {
      toast.error({ title: e.message || 'Error' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <DialogTheme open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitleTheme divider onClose={onClose}>
        <Trans>Add new referral</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="mt-4 flex items-center justify-between text-sm text-[#CED1D9]">
          <div>
            <Trans>Your max commission rate</Trans>
          </div>
          <div className="flex items-center gap-1 text-white">
            {formatNumberPercent(ratioData?.maxRatio, 0)}
            <Tooltips title={t`Your currently allocable commission rate.`}>
              <TipsFill size={16} />
            </Tooltips>
          </div>
        </div>

        <div className="my-5 h-[1px] bg-[#31333D]" />

        <div>
          <div className="text-sm font-medium text-white">
            <Trans>Note(optional)</Trans>
          </div>
          <div className="mt-2 rounded border border-[#31333D] hover:border-[#00E3A5]">
            <input
              className="w-full bg-transparent p-2 text-xs text-white outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={20}
              placeholder={t`Enter 1-20 character`}
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="text-sm font-medium text-white">
            <Trans>Set commission ratio</Trans>
          </div>
          <div className="mt-4 px-2">
            <Slider
              value={ratioIndex}
              step={1}
              min={0}
              max={optionsMaxLength}
              onChange={(_, value) => setRatioIndex(value as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => formatNumberPercent(ratioData?.options?.[v], 0)}
              sx={{
                color: '#00E3A5',
                '& .MuiSlider-track': {
                  backgroundColor: '#00E3A5',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#464852',
                  opacity: 1,
                },
                '& .MuiSlider-thumb': {
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '3px solid #00E3A5',
                  backgroundColor: '#202229',
                  boxShadow: 'none',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 6px rgba(0, 227, 165, 0.15)',
                  },
                },
                '& .MuiSlider-mark': {
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: '2px solid #464852',
                  backgroundColor: '#202229',
                },
                '& .MuiSlider-markActive': {
                  borderColor: '#00E3A5',
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#1f242b',
                  color: '#fff',
                },
              }}
              marks={marks}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#CED1D9]">
            <div className="flex gap-1">
              <span>
                <Trans>Friends rebate</Trans>
              </span>
              <span className="text-white">{formatNumberPercent(refereeRatio, 0)}</span>
            </div>
            <div className="flex gap-1">
              <span>
                <Trans>My rebate</Trans>
              </span>
              <span className="text-white">{formatNumberPercent(referrerRatio, 0)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FormControlLabel
            control={
              <CheckBox
                checked={flag === InvitationCodeFlag.DEFAULT}
                onChange={() =>
                  setFlag(
                    flag === InvitationCodeFlag.DEFAULT
                      ? InvitationCodeFlag.NON_DEFAULT
                      : InvitationCodeFlag.DEFAULT,
                  )
                }
              />
            }
            label={
              <span className="text-xs text-white">
                <Trans>Set as default</Trans>
              </span>
            }
          />
        </div>

        <div className="mt-8">
          <Button
            style={{
              height: '44px',
            }}
            className="w-full"
            loading={confirming}
            onClick={handleConfirm}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
