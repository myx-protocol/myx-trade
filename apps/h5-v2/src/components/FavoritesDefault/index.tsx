import { Trans } from '@lingui/react/macro'
import type { FavoritesDefaultItem } from '@myx-trade/sdk'
import {
  FavoritesDefaultItem as FavoritesDefaultItemComponent,
  type FavoritesDefaultItemProps,
} from './Item'
import { useFavoritesSelect } from './useFavoritesSelect'
import { PrimaryButton } from '../UI/Button'
import { useCallback, useState } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import clsx from 'clsx'

interface FavoritesDefaultProps {
  favorites: FavoritesDefaultItem[]
  cols?: number
  onAddFavoritesSuccess?: () => void
  size?: FavoritesDefaultItemProps['size']
  btnClassName?: string
}

export const FavoritesDefault = ({
  btnClassName,
  favorites,
  cols = 1,
  onAddFavoritesSuccess,
  size,
}: FavoritesDefaultProps) => {
  const { toggle, isSelected, getSelectedItems, selectedCount } = useFavoritesSelect()
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { setLoginModalOpen } = useWalletConnection()
  const [isLoading, setIsLoading] = useState(false)

  const addFavorites = useCallback(() => {
    const selectedItems = getSelectedItems()
    if (!clientIsAuthenticated) {
      return setLoginModalOpen(true)
    }
    if (selectedItems.length > 0 && client) {
      setIsLoading(true)
      client?.markets
        .addFavoritesBatch({
          list: selectedItems,
        })
        .then(() => {
          onAddFavoritesSuccess?.()
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [getSelectedItems, client, clientIsAuthenticated, setLoginModalOpen, onAddFavoritesSuccess])

  if (!favorites.length) {
    return null
  }

  return (
    <div className="relative w-full">
      <p className="text-secondary text-[14px] font-medium">
        <Trans>Select Token</Trans>
      </p>
      {/* list */}
      <div
        className={clsx('mt-[12px] grid gap-[12px]')}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {favorites.map((item) => (
          <FavoritesDefaultItemComponent
            size={size}
            key={item.poolId}
            item={item}
            selected={isSelected(item.chainId, item.poolId)}
            onSelectChange={() => {
              toggle(item.chainId, item.poolId)
            }}
          />
        ))}
      </div>
      {/* button */}
      <div className="sticky bottom-0 z-20 pt-[32px] pb-[24px]">
        <PrimaryButton
          style={{
            height: '44px',
            width: '100%',
            borderRadius: '999px',
            '&:disabled': {
              color: '#4D515C',
              backgroundColor: '#292B33',
              backgroundImage: 'none',
            },
          }}
          disabled={selectedCount() === 0}
          loading={isLoading}
          onClick={addFavorites}
          className={btnClassName}
        >
          <Trans>Add to Favorites</Trans>
        </PrimaryButton>
      </div>
    </div>
  )
}
