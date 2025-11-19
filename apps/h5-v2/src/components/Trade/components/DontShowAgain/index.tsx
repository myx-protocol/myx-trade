import { CheckBox } from '@/components/UI/CheckBox'
import { FormControlLabel } from '@/components/UI/FormControlLabel'

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
      label={<p>Dont show again</p>}
    />
  )
}
