import Yes from '@/components/Icon/set/Yes'
import { Radio as MuiRadio, styled, type RadioProps as MuiRadioProps } from '@mui/material'
import Big from 'big.js'
import { merge } from 'lodash-es'

const RadioDefaultIcon = styled('span')({
  display: 'flex',
  borderRadius: '999999px',
  border: '1px solid #848E9C',
  width: '100%',
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
  '.MuiRadio-root.Mui-disabled &': {
    border: '1px solid #31333D',
    backgroundColor: '#202129',
  },
})

const RadioCheckedIcon = ({ size = 10 }: { size?: number }) => {
  return (
    <span className="absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-full bg-[#00E3A5] text-[#000]">
      <Yes size={size} />
    </span>
  )
}

export const Radio = ({
  sx,
  size = '14px',
  ...props
}: Omit<MuiRadioProps, 'icon' | 'checkedIcon' | 'size'> & {
  size?: number | string
}) => {
  return (
    <MuiRadio
      sx={merge(
        {
          width: size,
          height: size,
          padding: '0px',
          flexShrink: 0,
        },
        sx,
      )}
      {...props}
      icon={<RadioDefaultIcon />}
      checkedIcon={<RadioCheckedIcon size={Big(parseInt(size.toString())).mul(0.7).toNumber()} />}
    />
  )
}
