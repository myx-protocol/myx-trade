import { SortDown, WalletLine } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import ToTrade from '@/components/Icon/set/ToTrade'
import ChangePosition from '@/components/Icon/set/ChangePosition'
import { Box, Slider, Typography } from '@mui/material'
import { useState } from 'react'

const marks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

export const TradeForm = () => {
  const [sliderValue, setSliderValue] = useState(0)
  return (
    <div>
      <div className="flex items-center justify-between">
        {/* left */}
        <div className="flex items-center justify-start gap-[8px] text-[12px] text-white">
          <p>
            <Trans>Market</Trans>
          </p>
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <div className="flex items-center justify-center gap-[2px]" role="button">
            <p>10x</p>
            <SortDown size={7} />
          </div>
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <p>1.5%</p>
        </div>

        {/* right */}
        <div className="flex items-center justify-end gap-[8px]">
          <div className="flex items-center gap-[2px]">
            <WalletLine size={12} color="#848E9C" role="button" />
            <p className="text-[12px] font-medium text-white">
              0.0000 <span>USDC</span>
            </p>
            <div className="flex rotate-[-90deg]">
              <ChangePosition size={12} color="#00E3A5" role="button" />
            </div>
          </div>
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <ToTrade size={12} color="#fff" role="button" />
        </div>
      </div>
      <div className="mt-[17px]">
        <Slider
          value={sliderValue}
          onChange={(_, newValue) => {
            // setUseSlider(true)
            setSliderValue(newValue as number)
          }}
          min={0}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          // slots={{
          //   valueLabel: ValueLabelComponent,
          // }}
          sx={{
            width: 'full',
            height: '12px',
            borderRadius: '9px',
            p: '0 7px',
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              background: '#fff',
              '&:hover': {
                boxShadow: 'none',
              },
            },
            '& .MuiSlider-rail': {
              opacity: 1,
              background: '#23252b',
              borderRadius: 9,
            },
            '& .MuiSlider-track': {
              background: 'linear-gradient(90deg, #4cb86a 0%, #3ba07b 100%)',
              borderRadius: 9,
            },
            '@media (pointer: coarse)': {
              padding: '0px!important',
            },
          }}
        />
        {/* 刻度 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '6px' }}>
          {marks.map((m) => (
            <Typography
              key={m.value}
              sx={{
                color: sliderValue >= m.value ? '#fff' : '#4D515C',
                fontSize: '10px',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {m.label}
            </Typography>
          ))}
        </Box>
      </div>
    </div>
  )
}
