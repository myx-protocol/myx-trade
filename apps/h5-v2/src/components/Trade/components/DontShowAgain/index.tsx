import { CheckBox } from '@/components/UI/CheckBox'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { Trans } from '@lingui/react/macro'

export const DontShowAgain = ({
  onChange,
  checked,
}: {
  onChange: (value: boolean) => void
  checked: boolean
}) => {
  return (
    <FormControlLabel
      control={<CheckBox onChange={() => onChange(!checked)} checked={checked} />}
      label={
        <p>
          <Trans>Dont show again</Trans>
        </p>
      }
    />
  )
}
