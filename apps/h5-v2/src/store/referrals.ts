import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import * as api from '@/api/referrals'
import type { ApiResponse } from '@/api/type'
import Big from 'big.js'
import type { Address } from 'viem'

export interface RefBonusInfo {
  claimedAmount: string
  availableAmount: string
  bonus: string
  rebates: string
  referees: number
  referrerRebate: string
}

export interface RefBonusChainInfo {
  chainId: number
  availableAmount: string
  token: string
  tokenAddress: Address
}

export interface RefClaimRecordInfo {
  account: string
  amount: string
  token: string
}

export interface RefConfigData {
  maxVipLevel: number
  codeCount: number
  remindLine: number
}

export enum InvitationCodeFlag {
  NON_DEFAULT,
  DEFAULT,
}

export interface InvitationCodeData {
  invitationCode: string
  referrer: string
  note: string
  referrerRatio: number
  refereeRatio: number
  referees: number
  flag: InvitationCodeFlag
}

export interface InvitationCodeInfo extends InvitationCodeData {
  invitationLink: string
  isDefault: boolean
}

export interface RefRatioData {
  maxRatio: number
  options: number[]
  invitationCode?: string
  referrerRatio: number
  refereeRatio: number
}

export interface RefRatioInfo extends RefRatioData {
  invitationLink?: string
}

interface ReferralState {
  bonusInfo: RefBonusInfo | null
  bonusChainInfo: RefBonusChainInfo[] | null
  recentClaims: RefClaimRecordInfo[] | null
  configData: RefConfigData | null
  invitationCodes: InvitationCodeInfo[]
  ratioInfo: RefRatioInfo | null
  referrerInfo: api.GetReferralByCodeResponse | null

  accessToken: string | null
  account: string | undefined

  // Loading states
  isLoadingBonus: boolean
  isLoadingChainBonus: boolean
  isLoadingClaims: boolean
  isLoadingConfig: boolean
  isLoadingCodes: boolean
  isLoadingRatio: boolean
  isLoadingReferrer: boolean

  // Dialog states
  isReceiveInviteDialogOpen: boolean
  isReceiveConfirmDialogOpen: boolean
  isReferFriendsDialogOpen: boolean
  isSelectReferralDialogOpen: boolean

  // Actions

  setReceiveInviteDialogOpen: (open: boolean) => void
  setReceiveConfirmDialogOpen: (open: boolean) => void
  setReferFriendsDialogOpen: (open: boolean) => void
  setSelectReferralDialogOpen: (open: boolean) => void
  setAccessParams: (accessToken: string | null, account: string) => void

  fetchRefBonus: () => Promise<void>
  fetchRefBonusInfoByChain: () => Promise<void>
  fetchRecentClaims: () => Promise<void>
  fetchRefConfig: () => Promise<void>
  fetchInvitationCodes: () => Promise<void>
  fetchRatioInfo: () => Promise<void>
  fetchRefReferrerInfo: () => Promise<void>

  createInvitationCode: (payload: {
    referrerRatio: number
    refereeRatio: number
    note?: string
    flag?: InvitationCodeFlag
  }) => Promise<void>
  setDefaultInvitationCode: (code: string) => Promise<void>
  updateInvitationNote: (code: string, note: string) => Promise<void>
  bindRelationshipByCode: (code: string) => Promise<ApiResponse<null> | undefined>
  getInvitationRelationships: (
    params: api.GetUserReferralDataParams,
  ) => Promise<api.UserReferralDataType[]>
}

export const useReferralStore = create<ReferralState>()(
  immer((set, get) => ({
    bonusInfo: null,
    bonusChainInfo: null,
    recentClaims: null,
    configData: null,
    invitationCodes: [],
    ratioInfo: null,
    referrerInfo: null,
    accessToken: null,
    account: undefined,

    isLoadingBonus: false,
    isLoadingChainBonus: false,
    isLoadingClaims: false,
    isLoadingConfig: false,
    isLoadingCodes: false,
    isLoadingRatio: false,
    isLoadingReferrer: false,

    isReceiveInviteDialogOpen: false,
    isReceiveConfirmDialogOpen: false,
    isReferFriendsDialogOpen: false,
    isSelectReferralDialogOpen: false,

    setReceiveInviteDialogOpen: (open) => set({ isReceiveInviteDialogOpen: open }),
    setReceiveConfirmDialogOpen: (open) => set({ isReceiveConfirmDialogOpen: open }),
    setReferFriendsDialogOpen: (open) => set({ isReferFriendsDialogOpen: open }),
    setSelectReferralDialogOpen: (open) => set({ isSelectReferralDialogOpen: open }),
    setAccessParams: (accessToken, account) => set({ accessToken, account }),

    fetchRefBonus: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingBonus: true })
      try {
        const res = await api.getUserReferralStatistics({ accessToken, account })
        const data = res.data
        // Map new API response to RefBonusInfo
        // Note: availableAmount is not directly in UserReferralStatisticsType,
        // it will be updated when fetchRefBonusInfoByChain is called or we need to derive it.
        // For now, we keep existing availableAmount or default to '0' if not present.
        // However, to avoid UI flickering, we might want to wait for chain info.
        // But let's map what we have.
        set((state) => {
          state.bonusInfo = {
            claimedAmount: data?.claimedAmount || '0',
            availableAmount: state.bonusInfo?.availableAmount || '0', // Preserve or default
            bonus: data?.referralRebate || '0',
            rebates: data?.refereeRebate || '0',
            referees: data?.referees || 0,
            referrerRebate: data?.referrerRebate || '0',
          }
        })
      } catch (e) {
        console.error('fetchRefBonus error', e)
      } finally {
        set({ isLoadingBonus: false })
      }
    },

    fetchRefBonusInfoByChain: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingChainBonus: true })
      try {
        const res = await api.getReferralClaimCountByChain({ accessToken, account })
        const chainData = res.data || []

        // Map to RefBonusChainInfo
        const mappedChainInfo: RefBonusChainInfo[] = chainData.map((item) => ({
          chainId: item.chainId,
          availableAmount: Big(item.referral).minus(item.claimed).toString(),
          token: item.tokenName || 'USDC', // Default to USDC as it's not in the response
          tokenAddress: item.token,
        }))

        set((state) => {
          state.bonusChainInfo = mappedChainInfo
          if (state.bonusInfo) {
            let total = 0
            mappedChainInfo.forEach((c) => {
              total += parseFloat(c.availableAmount || '0')
            })
            state.bonusInfo.availableAmount = total.toString()
          }
        })
      } catch (e) {
        console.error('fetchRefBonusInfoByChain error', e)
      } finally {
        set({ isLoadingChainBonus: false })
      }
    },

    fetchRecentClaims: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingClaims: true })
      try {
        const res = await api.getClaimNoticeList({ limit: 20 }, { accessToken, account })
        const data = res.data || []
        set({
          recentClaims: data.map((item) => ({
            account: item.account,
            amount: item.amount,
            token: item.tokenName || 'USDC', // Default
          })),
        })
      } catch (e) {
        console.error('fetchRecentClaims error', e)
      } finally {
        set({ isLoadingClaims: false })
      }
    },

    fetchRefConfig: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingConfig: true })
      try {
        const res: any = await api.getReferralConfig({ accessToken, account })
        set({ configData: res.data })
      } catch (e) {
        console.error('fetchRefConfig error', e)
      } finally {
        set({ isLoadingConfig: false })
      }
    },

    fetchInvitationCodes: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingCodes: true })
      try {
        const res = await api.listInvitationCodes({ accessToken, account })
        const codes: InvitationCodeInfo[] = (res.data || []).map((data) => ({
          ...data,
          invitationLink: `https://${window.location.hostname}/referrals?invitationCode=${data.invitationCode}`,
          isDefault: data.flag === 1, // 1 is DEFAULT
          flag: data.flag === 1 ? InvitationCodeFlag.DEFAULT : InvitationCodeFlag.NON_DEFAULT,
        }))
        set({ invitationCodes: codes })
      } catch (e) {
        console.error('fetchInvitationCodes error', e)
      } finally {
        set({ isLoadingCodes: false })
      }
    },

    fetchRatioInfo: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingRatio: true })
      try {
        const res = await api.getReferralRatio({ accessToken, account })
        const data = res.data
        if (data) {
          set({
            ratioInfo: {
              maxRatio: data.maxRatio,
              options: data.options,
              invitationCode: data.invitationCode?.toString(), // Convert number to string if needed
              referrerRatio: data.referrerRatio,
              refereeRatio: data.refereeRatio,
              invitationLink: data.invitationCode
                ? `https://${window.location.hostname}/referrals?invitationCode=${data.invitationCode}`
                : undefined,
            },
          })
        }
      } catch (e) {
        console.error('fetchRatioInfo error', e)
      } finally {
        set({ isLoadingRatio: false })
      }
    },

    fetchRefReferrerInfo: async () => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      set({ isLoadingReferrer: true })
      try {
        const res = await api.getReferrerInfo({ accessToken, account })
        set({ referrerInfo: res.data })
      } catch (e) {
        console.error('fetchRefReferrerInfo error', e)
      } finally {
        set({ isLoadingReferrer: false })
      }
    },

    createInvitationCode: async (payload) => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      try {
        await api.createInvitationCode(payload, { accessToken, account })
        await get().fetchInvitationCodes()
      } catch (e) {
        console.error('createInvitationCode error', e)
        throw e
      }
    },

    setDefaultInvitationCode: async (code) => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      try {
        await api.setDefaultInvitationCode({ code }, { accessToken, account })
        await get().fetchInvitationCodes()
      } catch (e) {
        console.error('setDefaultInvitationCode error', e)
        throw e
      }
    },

    updateInvitationNote: async (code, note) => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      try {
        await api.updateInvitationNote(code, note, { accessToken, account })
        await get().fetchInvitationCodes()
      } catch (e) {
        console.error('updateInvitationNote error', e)
        throw e
      }
    },

    bindRelationshipByCode: async (code) => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return
      try {
        const res = await api.bindRelationshipByCode({ code }, { accessToken, account })
        if (res.code === 9200) {
          await get().fetchRefReferrerInfo()
        }
        return res
      } catch (e) {
        console.error('bindRelationshipByCode error', e)
        throw e
      }
    },

    getInvitationRelationships: async (params) => {
      const { accessToken, account } = get()
      if (!accessToken || !account) return []
      try {
        const res = await api.getUserReferralData(params, { accessToken, account })
        return res.data || []
      } catch (e) {
        console.error('getInvitationRelationships error', e)
        throw e
      }
    },
  })),
)
