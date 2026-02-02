import { MenuItem, Select as MuiSelect, type SelectProps } from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
import { CoinIcon } from '../CoinIcon'

// 自定义箭头组件，根据开关状态显示不同图标
const CustomArrow = () => <KeyboardArrowDown sx={{ color: 'white', fontSize: '16px' }} />

interface CustomSelectProps extends Omit<SelectProps, 'children'> {
  isSingle?: boolean
  options: { label: string | React.ReactNode; value: string; icon?: string | React.ReactElement }[]
}

export const Select = ({
  value,
  onChange,
  defaultValue,
  options,
  isSingle = false,
  sx,
  name,
  ...props
}: CustomSelectProps) => {
  return (
    <MuiSelect
      {...props}
      name={name || 'select'} // 如果没有提供name，使用默认值
      IconComponent={CustomArrow}
      sx={{
        color: 'white',
        borderRadius: '7px',
        fontSize: '12px',
        minWidth: '28px',
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '& .MuiSelect-select': {
          padding: isSingle ? '0' : '8px 12px',
          paddingRight: '0px !important',
          display: 'flex !important',
          alignItems: 'center !important',
          whiteSpace: 'nowrap !important',
          overflow: 'hidden !important',
        },
        '& .MuiSelect-icon': {
          right: '0px',
        },
        ...sx,
      }}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: '#202129 !important',
            '& .MuiList-root': {
              paddingTop: 0,
              paddingBottom: 0,
            },
            '& .MuiMenuItem-root': {
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#202129 !important',
              '&:hover': {
                backgroundColor: '#18191F !important',
              },
              '&.Mui-selected': {
                backgroundColor: '#18191F !important',
              },
            },
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          className="flex items-center px-[6px] py-[8px] text-[12px]"
        >
          {option.icon && (
            <>
              {typeof option.icon === 'string' ? (
                <CoinIcon size={24} icon={option.icon ?? ''} />
              ) : (
                option.icon
              )}
            </>
          )}
          <div className="px-[4px] py-[2px] text-[12px] text-[#FFFFFF]">{option.label}</div>
        </MenuItem>
      ))}
    </MuiSelect>
  )
}
