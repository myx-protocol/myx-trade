import { CircularProgress } from '@mui/material'

export const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <CircularProgress
        size={30}
        sx={{
          color: '#00e3a5',
        }}
      />
    </div>
  )
}
