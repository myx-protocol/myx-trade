import { Trans } from '@lingui/react/macro'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { useEffect, useState } from 'react'
import { t } from '@lingui/core/macro'
import { PrimaryButton } from '../UI/Button'
import WarningOutlineIcon from '../Icon/set/WarningOutline'
import { Tooltips } from '../UI/Tooltips'
import { fetchVipInfo, redeemVipCode } from '@/request/vip'
import { useAccessParams } from '@/hooks/useAccessParams'
import { toast } from '../UI/Toast'
import clsx from 'clsx'
import { useFetchUserVipInfo } from '@/hooks/vip/useVipLevel'

const MIN_LENGTH = 7
const MAX_LENGTH = 12

export const VipRedeemDialog = () => {
  const {
    vipRedeemDialogOpen,
    setVipRedeemDialogOpen,
    setVipRedeemResultDialogOpen,
    setVipRedeemResultData,
  } = useGlobalStore()

  const [inputValue, setInputValue] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => setIsLoading(false), 2000)
    }
  }, [isLoading])

  const paste = async () => {
    const text = (await navigator.clipboard.readText()).trim()
    const value = text?.slice(0, MAX_LENGTH)
    setInputValue(value)
  }

  const validate = (text: string) => {
    return /^[\dA-Za-z]*$/.test(text) && text.length >= MIN_LENGTH && text.length <= MAX_LENGTH
  }
  useEffect(() => {
    setInvalid(!validate(inputValue))
  }, [inputValue])

  const accessParams = useAccessParams()

  const onSubmit = async () => {
    // console.log('onSubmit')
    if (invalid || isLoading || !accessParams) return
    setIsLoading(true)

    try {
      const userVipInfo = await fetchVipInfo(accessParams.account, accessParams.accessToken)
      if (userVipInfo.code !== 9200) {
        return toast.error({
          title: userVipInfo.msg || 'Network Error',
        })
      }
      const res = await redeemVipCode(
        {
          code: inputValue,
        },
        accessParams,
      )
      if (res.code !== 9200) {
        return toast.error({
          title: res.msg || 'Network Error',
        })
      }
      if (res.data.level > 0 && res.data.startTime && res.data.endTime) {
        setVipRedeemDialogOpen(false)
        setVipRedeemResultData({
          ...res.data,
          oldLevel: userVipInfo.data?.level || 0,
        })
        setVipRedeemResultDialogOpen(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DialogTheme open={vipRedeemDialogOpen} onClose={() => setVipRedeemDialogOpen(false)}>
      <DialogTitleTheme
        divider
        onClose={() => {
          setVipRedeemDialogOpen(false)
        }}
      >
        <Trans>Redeem Code</Trans>
      </DialogTitleTheme>

      {/* content */}
      <div className="p-[16px]">
        <p className="text-[14px] leading-[1] text-white">
          <Trans>Enter Code</Trans>
        </p>
        {/* input */}
        <div className="mt-[16px] flex items-center gap-[16px] rounded-[8px] border border-[#3c3d45] bg-[#101114] px-[16px] py-[12px]">
          <input
            type="text"
            className="flex-[1_1_0%] bg-none text-[12px] text-white outline-[0] placeholder:text-[#4d515c]"
            placeholder={t`Please Enter the Redemption Code`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.trim())}
          />
          <p className="text-green text-[12px]" role="button" onClick={paste}>
            <Trans>Paste</Trans>
          </p>
        </div>
        <div
          className={clsx('mt-[8px]', {
            visible: inputValue && invalid,
            invisible: !inputValue || !invalid,
          })}
        >
          <p className="text-danger text-[12px]">
            <Trans>The code format is incorrect</Trans>
          </p>
        </div>

        <PrimaryButton
          style={{
            width: '100%',
            height: '44px',
            marginTop: '12px',
          }}
          disabled={invalid}
          onClick={onSubmit}
          loading={isLoading}
        >
          <Trans>Confirm</Trans>
        </PrimaryButton>
        <Tooltips
          placement="bottom"
          title={t` The redemption code is an exclusive benefit from MYX. Once activated, it unlocks special rights. Get
                  your code by participating in MYX’s special events.`}
        >
          <div className="mx-auto mt-[8px] flex w-fit items-center justify-center gap-[4px] text-[12px] text-[#CED1D9]">
            <WarningOutlineIcon size={14} />
            <Trans>How to Obtain a Redemption Code</Trans>
          </div>
        </Tooltips>
      </div>
    </DialogTheme>
  )
}
