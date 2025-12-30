import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { t } from '@lingui/core/macro'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { encryptionAddress } from '@/utils'
import walletIcon from '@/assets/icon/commons/wallet.svg'
import { useEffect } from 'react'

export const SelectAccountDialog = () => {
  const {
    selectedSeamlessAccountDialogOpen,
    setSelectedSeamlessAccountDialogOpen,
    setUnlockAccountDialogOpen,
  } = useGlobalStore()

  const {
    seamlessAccountList,
    setSeamlessAccountList,
    setActiveSeamlessAddress,
    activeSeamlessAddress,
  } = useSeamlessStore()

  useEffect(() => {
    const firstSeamlessAccount = seamlessAccountList[0]
    setActiveSeamlessAddress(firstSeamlessAccount?.masterAddress || '')
  }, [])

  return (
    <DialogBase
      title={t`Select  Account`}
      open={selectedSeamlessAccountDialogOpen}
      onClose={() => setSelectedSeamlessAccountDialogOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '390px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <div className="p-[16px]">
        <div className="mt-[32px] flex flex-col gap-[10px]">
          {seamlessAccountList.map((item) => {
            const isActive = item.masterAddress === activeSeamlessAddress
            return (
              <div
                key={item.seamlessAddress}
                className="flex items-center gap-[4px] rounded-[8px] border-[1px] p-[20px]"
                style={{ borderColor: isActive ? '#00E3A5' : '#3A404A' }}
                onClick={() => {
                  const newSeamlessAccountList = seamlessAccountList.map((item) => ({
                    ...item,
                    active: false,
                  }))

                  const idx = newSeamlessAccountList.findIndex(
                    (item) => item.seamlessAddress === item.seamlessAddress,
                  )
                  if (idx !== -1) {
                    newSeamlessAccountList[idx].active = true
                  }

                  setSeamlessAccountList(newSeamlessAccountList)
                  setActiveSeamlessAddress(item.masterAddress)
                  setSelectedSeamlessAccountDialogOpen(false)
                  setUnlockAccountDialogOpen(true)
                }}
              >
                <img src={walletIcon} className="h-[14px] w-[14px]" />
                <p className="text-[white]">{encryptionAddress(item.masterAddress)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </DialogBase>
  )
}
