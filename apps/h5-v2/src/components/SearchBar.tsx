import { Box } from '@mui/material'
import { Search } from './Search'
import { useCallback, useRef } from 'react'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'

export const SearchBar = ({ className }: { className?: string }) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const onFocus = useCallback(() => {
    openGlobalSearch()
  }, [openGlobalSearch])
  return (
    <Box className={`mt-[12px] pr-[16px] pl-[16px]`}>
      <Search ref={searchRef} isRounded={false} onFocus={onFocus} canPaste={false} />
    </Box>
  )
}
