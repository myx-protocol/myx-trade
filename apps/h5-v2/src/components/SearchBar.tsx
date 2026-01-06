import { Box } from '@mui/material'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { SearchIcon } from '@/components/Icon'

export const SearchBar = ({ className }: { className?: string }) => {
  const { open } = useGlobalSearchStore()

  return (
    <Box className={`mt-[12px] pr-[16px] pl-[16px]`}>
      <div
        className="flex rounded-[6px] bg-[#18191F] px-[14px] py-[12px]"
        role="button"
        onClick={() => open()}
      >
        <SearchIcon size={12} color="#6D7180" />
        <p className="ml-[8px] text-[13px] font-medium text-[#6D7180]">BTCUSDC</p>
      </div>
    </Box>
  )
}
