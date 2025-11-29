import { Box } from '@mui/material'
import { Search } from './Search'
import { useCallback, useRef } from 'react'

export const SearchBar = ({ className }: { className?: string }) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const onFocus = useCallback(() => {}, [])
  return (
    <Box className={`mt-[12px] pr-[16px] pl-[16px]`}>
      <Search ref={searchRef} isRounded={false} onFocus={onFocus} />
    </Box>
  )
}
