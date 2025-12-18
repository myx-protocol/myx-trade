import type { MouseEventHandler } from 'react'
import Star from '@/components/Icon/set/Star'

export const Favorite = ({
  onFavoriteChange,
  isFavorite,
}: {
  onFavoriteChange: () => void
  isFavorite: boolean
}) => {
  const handleBeforeFavoriteChange: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (onFavoriteChange) {
      onFavoriteChange()
    }
  }
  return (
    <div
      className="flex h-[18px] w-[18px] cursor-pointer select-none"
      onClick={handleBeforeFavoriteChange}
    >
      <Star size={18} color={isFavorite ? '#00E3A5' : '#6D7180'} />
    </div>
  )
}
