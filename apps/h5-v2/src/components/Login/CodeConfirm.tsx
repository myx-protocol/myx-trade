import { DialogBase } from '../UI/DialogBase'
import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { CodeInput } from './CodeInput'
import { PrimaryButton } from '../UI/Button'

export const CodeConfirm = ({ email }: { email: string }) => {
  const [codeError, setCodeError] = useState(false)
  const [countdown, setCountdown] = useState(60) // 倒计时60秒
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  // // 倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      setIsCountdownActive(false)
      setCountdown(60) // 重置倒计时
    }
    return () => clearTimeout(timer)
  }, [isCountdownActive, countdown])

  // // 启动倒计时
  const startCountdown = () => {
    setIsCountdownActive(true)
    setCountdown(60)
  }
  // // 重新发送验证码
  const resendCode = () => {
    if (!isCountdownActive) {
      console.log('重新发送验证码到:', email)
      startCountdown()
    }
  }
  return (
    <DialogBase open={false} onClose={() => {}} title={''}>
      <div className="mt-[28px]">
        <p className="text-[14px] font-[500] text-[#848E9C]">
          <Trans>Email has been sent</Trans>
        </p>
        <p className="text-[20px] font-[500] text-[white]">{email}</p>
        <div className="mt-[32px] flex items-center gap-[10px]">
          <CodeInput
            length={6}
            autoFocus
            error={codeError}
            onChange={(value) => {
              setCodeError(false) // 输入时清除错误状态
              console.log('验证码:', value)
            }}
            onComplete={(value) => {
              console.log('验证码输入完成:', value)
              // 模拟验证失败
              if (value !== '123456') {
                setCodeError(true)
              }
            }}
          />
        </div>
        {codeError && (
          <p className="mt-[12px] text-[14px] font-[500] text-[#EC605A]">Invalid code</p>
        )}

        {/* 重新发送验证码 */}
        <div className="mt-[20px] flex items-center">
          <button
            onClick={resendCode}
            disabled={isCountdownActive}
            className={`text-[14px] ${
              isCountdownActive
                ? 'cursor-not-allowed text-[#848E9C]'
                : 'cursor-pointer text-[#00E3A5]'
            }`}
          >
            {isCountdownActive ? <Trans>Resend in {countdown}s</Trans> : <Trans>Resend code</Trans>}
          </button>
        </div>

        <PrimaryButton
          className="h-[44px] w-full"
          style={{ marginTop: '24px', borderRadius: '44px' }}
        >
          <Trans>Confirm</Trans>
        </PrimaryButton>
      </div>
    </DialogBase>
  )
}
