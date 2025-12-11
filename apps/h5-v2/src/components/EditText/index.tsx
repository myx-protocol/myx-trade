import { useState } from 'react'
import IconEdit from '@/components/Icon/set/EditSimply'
import { NumberInputPrimitive } from '../UI/NumberInput/NumberInputPrimitive'
import SureIcon from '../UI/Icon/SureIcon'
import CloseIcon from '../UI/Icon/CloseIcon'
import { displayAmount } from '@/utils/number'
import { CircularProgress } from '@mui/material'

export const EditText = ({
  loading,
  value,
  onChange,
  unit,
  editWidth,
  symbol,
}: {
  loading?: boolean
  symbol?: string
  value: string
  unit?: string
  editWidth?: number
  onChange: (value: string, cb?: () => void) => void
}) => {
  const [isEdit, setIsEdit] = useState(false)
  const [text, setText] = useState<string>(value)
  if (!isEdit) {
    return (
      <div className="flex h-[28px] items-center gap-[4px]">
        <p className="font-medium text-white">
          {symbol ? symbol : ''}
          {displayAmount(value)} {unit ?? ''}
        </p>
        <span className="flex" onClick={() => setIsEdit(true)}>
          <IconEdit size={12} color="#fff" />
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-[28px] items-center gap-[4px]" style={{ width: editWidth ?? 'auto' }}>
      <CloseIcon
        size={12}
        color={loading ? '#848E9C' : '#fff'}
        className="cursor-pointer"
        onClick={() => {
          setText(value)
          setIsEdit(false)
        }}
      />
      <NumberInputPrimitive
        className="w-[50px] rounded-[4px] bg-[#202129] px-[12px] py-[8px] text-center text-[12px] font-medium"
        value={text}
        onValueChange={(values) => setText(values.value)}
      />
      {!loading ? (
        <SureIcon
          size={12}
          color={loading ? '#848E9C' : '#fff'}
          className="cursor-pointer"
          onClick={() => {
            onChange(text, () => setIsEdit(false))
          }}
        />
      ) : (
        <CircularProgress size={12} className="text-white" />
      )}
    </div>
  )
}
