import { Box, CircularProgress } from '@mui/material'
import type { CircularProgressProps } from '@mui/material'
import Logo from '@/assets/loading/logo.gif'

export type SuspenseLoadingProps = Prettify<Pick<CircularProgressProps, 'size'>> & {
  block?: boolean
}

export const SuspenseLoading = ({ size, block, ...props }: SuspenseLoadingProps) => {
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: block ? 'flex' : 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
      {...props}
    >
      <CircularProgress size={size} />
    </div>
  )
}
//
export const SuspenseLogo = (props: { className?: string }) => {
  return (
    <Box className={'flex flex-1 items-center justify-center'} {...props}>
      <img src={Logo} className={'pointer-none user-select-none h-[50px]'} />
    </Box>
  )
}
