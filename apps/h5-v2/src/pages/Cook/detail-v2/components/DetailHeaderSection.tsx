import { SubTabBar } from '@/components/SubTabBar'
import { Box } from '@mui/material'
import { useMemo } from 'react'

type ActionTab = { key: 'deposit' | 'redeem' | 'activate'; label: string }
type VaultTab = { key: 'base' | 'stable'; label: string }

interface DetailHeaderSectionProps {
  actionTabs: ActionTab[]
  activeAction: 'deposit' | 'redeem' | 'activate'
  onChangeAction: (action: 'deposit' | 'redeem' | 'activate') => void
  getActionLabel: (action: 'deposit' | 'redeem' | 'activate') => string
  isShowVaultTabs: boolean
  vaultTabList: VaultTab[]
  activeVault: 'base' | 'stable'
  onChangeVault: (vault: 'base' | 'stable') => void
  getVaultLabel: (vault: 'base' | 'stable') => string
  /** 仅展示操作 Tab（置于顶部导航下） */
  showActionTabsOnly?: boolean
  /** 仅展示金库切换（置于内容区） */
  showVaultTabsOnly?: boolean
}

export const DetailHeaderSection = ({
  actionTabs,
  activeAction,
  onChangeAction,
  getActionLabel,
  isShowVaultTabs,
  vaultTabList,
  activeVault,
  onChangeVault,
  getVaultLabel,
  showActionTabsOnly = false,
  showVaultTabsOnly = false,
}: DetailHeaderSectionProps) => {
  const subTabItems = useMemo(
    () =>
      actionTabs.map((tab) => ({
        value: tab.key,
        label: getActionLabel(tab.key),
      })),
    [actionTabs, getActionLabel],
  )

  if (showVaultTabsOnly) {
    if (!isShowVaultTabs) return null
    return (
      <Box className="flex h-[42px] w-full rounded-[10px] bg-[#18191F] p-[2px]">
        {vaultTabList.map((vault) => {
          const isActive = activeVault === vault.key
          return (
            <Box
              key={vault.key}
              role="button"
              className={`flex flex-1 items-center justify-center rounded-[8px] text-[13px] font-[500] ${isActive ? 'bg-[#292B33] text-white' : 'text-[#848E9C]'}`}
              onClick={() => onChangeVault(vault.key)}
            >
              {getVaultLabel(vault.key)}
            </Box>
          )
        })}
      </Box>
    )
  }

  if (showActionTabsOnly) {
    return (
      <SubTabBar
        className="!border-[#31333D]"
        items={subTabItems}
        value={activeAction}
        handleChange={onChangeAction}
      />
    )
  }

  return (
    <>
      <SubTabBar items={subTabItems} value={activeAction} handleChange={onChangeAction} />
      {isShowVaultTabs && (
        <Box className="mt-[12px] flex h-[42px] rounded-[10px] bg-[#18191F] p-[2px]">
          {vaultTabList.map((vault) => {
            const isActive = activeVault === vault.key
            return (
              <Box
                key={vault.key}
                role="button"
                className={`flex flex-1 items-center justify-center rounded-[8px] text-[13px] font-[500] ${isActive ? 'bg-[#292B33] text-white' : 'text-[#848E9C]'}`}
                onClick={() => onChangeVault(vault.key)}
              >
                {getVaultLabel(vault.key)}
              </Box>
            )
          })}
        </Box>
      )}
    </>
  )
}
