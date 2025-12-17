import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { useEffect, useState } from 'react'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { Skeleton } from '@/components/UI/Skeleton'
import { getUserReferralData, getRefereeReferralFlow, extractReferralFlow } from '@/api/referrals'
import { formatNumberPrecision } from '@/utils/formatNumber'
import { encryptionAddress } from '@/utils'
import { toast } from '@/components/UI/Toast'
import { useCopyToClipboard } from 'usehooks-ts'
import { ModuleTitle } from '../ModuleTitle'
import { StatisticsDialog } from '../StatisticsDialog'
import Copy from '@/components/Icon/set/Copy'
import ArrowRight from '@/components/Icon/set/ArrowRight'
import Prev from '@/components/Icon/set/Prev'
import Next from '@/components/Icon/set/Next'
import dayjs from 'dayjs'
import { getChainInfo } from '@/config/chainInfo'
import { TransactionHash } from '@/components/TransactionHash'
import { Loading } from '../Loading'
import { ReferralsEmpty } from '../Empty'

enum RecordTypeEnum {
  Invite = 0,
  Rebase = 1,
  Claim = 2,
}

const PAGE_SIZE = 10

export const RecordCard = () => {
  const { fetchRefBonus, fetchRefBonusInfoByChain, fetchRefConfig, isLoadingBonus, accessToken } =
    useReferralStore()
  const accessParams = useAccessParams()
  const [recordType, setRecordType] = useState<RecordTypeEnum>(RecordTypeEnum.Invite)
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [before, setBefore] = useState<string | number | undefined>(undefined)
  const [after, setAfter] = useState<string | number | undefined>(undefined)
  const [, copy] = useCopyToClipboard()
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [currentReferee, setCurrentReferee] = useState<string>('')

  const fetchData = async () => {
    if (!accessParams?.accessToken || !accessParams.account) return // Only check accessToken, 'account' is not used here
    setLoading(true)
    try {
      let res: any
      // New APIs do not support pagination params in the interface definition
      // const params = { limit: PAGE_SIZE, before, after }

      if (recordType === RecordTypeEnum.Invite) {
        res = await getUserReferralData(accessParams)
        // Map to expected format
        const data = (res.data || []).map((item: any) => ({
          id: item.invitationCode, // Use code as ID
          referee: item.referee,
          contribute: item.referralRebate,
          createTime: item.createTime,
          referrerRatio: item.referrerRatio,
          refereeRatio: item.refereeRatio,
        }))
        setList(data)
      } else if (recordType === RecordTypeEnum.Rebase) {
        res = await getRefereeReferralFlow(accessParams)
        // Map to expected format
        const data = (res.data || []).map((item: any) => ({
          id: item.id,
          rebateTime: item.txTime,
          account: item.account,
          chainId: item.chainId,
          amount: item.receiveAmount,
          token: 'USDC', // Default
          rebateType: item.rebateType,
        }))
        setList(data)
      } else {
        res = await extractReferralFlow(accessParams)
        // Map to expected format
        const data = (res.data || []).map((item: any) => ({
          id: item.txHash, // Use hash as ID
          claimTime: item.txTime,
          chainId: item.chainId,
          txHash: item.txHash,
          amount: item.claimAmount,
          token: 'USDC', // Default
        }))
        setList(data)
      }
    } catch (e) {
      console.error(e)
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInitialData = async () => {
    if (accessParams?.accessToken && accessParams.account) {
      await Promise.all([fetchRefBonus(), fetchRefBonusInfoByChain(), fetchRefConfig()])
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [accessParams?.accessToken, accessParams?.account])

  useEffect(() => {
    fetchData()
  }, [accessParams, recordType, before, after, accessParams?.accessToken, accessParams?.account]) // Added accessToken to dependencies

  const handlePrev = () => {
    if (list.length > 0) {
      setBefore(list[0].id)
      setAfter(undefined)
    }
  }

  const handleNext = () => {
    if (list.length > 0) {
      setAfter(list[list.length - 1].id)
      setBefore(undefined)
    }
  }

  const handleChangeType = (type: RecordTypeEnum) => {
    setRecordType(type)
    setBefore(undefined)
    setAfter(undefined)
    setList([])
  }

  return (
    <div className="mt-[40px] lg:mt-[68px]">
      <ModuleTitle>
        <Trans>My Records</Trans>
      </ModuleTitle>

      <div className="mt-5 flex gap-8 border-b border-[#31333D]">
        {[
          { label: t`Referral History`, value: RecordTypeEnum.Invite },
          { label: t`Rebate History`, value: RecordTypeEnum.Rebase },
          { label: t`Claim History`, value: RecordTypeEnum.Claim },
        ].map((item) => (
          <div
            key={item.value}
            className={`relative cursor-pointer pb-3 text-sm lg:text-lg ${recordType === item.value ? 'text-[#FFD873]' : 'text-[#CED1D9] hover:text-[#FFD873]'}`}
            onClick={() => handleChangeType(item.value)}
          >
            {item.label}
            {recordType === item.value && (
              <div className="absolute bottom-[-1px] left-0 h-[1px] w-full bg-[#FFD873]" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 block lg:hidden">
        {/* Mobile View */}
        {loading ? (
          <></>
        ) : (
          <>
            {list.map((item) => (
              <MobileRecordItem
                key={item.id}
                type={recordType}
                item={item}
                copy={copy}
                onStatistics={(referee: string) => {
                  setCurrentReferee(referee)
                  setStatisticsOpen(true)
                }}
              />
            ))}
            {list.length === 0 && (
              <div className="h-[150px]">
                <ReferralsEmpty />
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#31333D] text-[#CED1D9]">
              <th className="py-2 font-normal">
                <Trans>Time</Trans>
              </th>
              {recordType === RecordTypeEnum.Invite && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Friends</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>You Receive</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Friends Receive</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Rebate</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Action</Trans>
                  </th>
                </>
              )}
              {recordType === RecordTypeEnum.Rebase && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Address</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Chain</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Amount</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Type</Trans>
                  </th>
                </>
              )}
              {recordType === RecordTypeEnum.Claim && (
                <>
                  <th className="py-2 font-normal">
                    <Trans>Chain</Trans>
                  </th>
                  <th className="py-2 font-normal">
                    <Trans>Hash</Trans>
                  </th>
                  <th className="py-2 text-right font-normal">
                    <Trans>Amount</Trans>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-4">
                  <div className="h-[150px]">
                    <Loading />
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {list.map((item) => (
                  <DesktopRecordItem
                    key={item.id}
                    type={recordType}
                    item={item}
                    copy={copy}
                    onStatistics={(referee: string) => {
                      setCurrentReferee(referee)
                      setStatisticsOpen(true)
                    }}
                  />
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#CED1D9]">
                      <div className="h-[150px]">
                        <ReferralsEmpty />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {list.length > 0 && (
        <div className="mt-4 flex justify-end gap-4">
          <div
            className={`cursor-pointer ${!after && !before ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
            onClick={() => {
              if (after || before) handlePrev()
            }}
          >
            <Prev size={12} />
          </div>
          <div
            className={`cursor-pointer ${list.length < PAGE_SIZE ? 'cursor-not-allowed text-[#31333D]' : 'text-white'}`}
            onClick={() => {
              if (list.length === PAGE_SIZE) handleNext()
            }}
          >
            <Next size={12} />
          </div>
        </div>
      )}

      <StatisticsDialog
        open={statisticsOpen}
        onClose={() => setStatisticsOpen(false)}
        referee={currentReferee}
      />
    </div>
  )
}

const MobileRecordItem = ({ type, item, copy, onStatistics }: any) => {
  return (
    <div className="flex flex-col gap-4 border-b border-[#31333D] p-4">
      <div className="flex justify-between">
        <div className="text-xs text-[#CED1D9]">
          <Trans>Time</Trans>
        </div>
        <div className="text-sm text-white">
          {dayjs(
            type === RecordTypeEnum.Rebase
              ? item.rebateTime * 1000
              : type === RecordTypeEnum.Claim
                ? item.claimTime * 1000
                : item.createTime,
          ).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </div>

      {type === RecordTypeEnum.Invite && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Referee</Trans>
            </div>
            <div className="flex items-center gap-1 text-sm text-white">
              {encryptionAddress(item.referee)}
              <Copy
                size={14}
                className="cursor-pointer"
                onClick={() =>
                  copy(item.referee).then(
                    (rs: any) => rs && toast.success({ title: t`Copy success` }),
                  )
                }
              />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>ReferrerRatio</Trans>
            </div>
            <div className="text-sm text-white">{item.referrerRatio}%</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>RefereeRatio</Trans>
            </div>
            <div className="text-sm text-white">{item.refereeRatio}%</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Rebate</Trans>
            </div>
            <div className="text-sm text-white">{formatNumberPrecision(item.contribute, 2)}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Action</Trans>
            </div>
            <div
              className="flex cursor-pointer items-center gap-1 text-sm text-[#00E3A5]"
              onClick={() => onStatistics(item.referee)}
            >
              <Trans>Statistics</Trans>
              <ArrowRight size={14} />
            </div>
          </div>
        </>
      )}

      {type === RecordTypeEnum.Rebase && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Address</Trans>
            </div>
            <div className="flex items-center gap-1 text-sm text-white">
              {encryptionAddress(item.account)}
              <Copy
                size={14}
                className="cursor-pointer"
                onClick={() =>
                  copy(item.account).then(
                    (rs: any) => rs && toast.success({ title: t`Copy success` }),
                  )
                }
              />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Chain</Trans>
            </div>
            <div className="text-sm text-white">{getChainInfo(item.chainId)?.label ?? '--'}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Amount</Trans>
            </div>
            <div className="text-sm text-white">
              {formatNumberPrecision(item.amount, 2)} {item.token}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Type</Trans>
            </div>
            <div className="text-sm text-white">{item.rebateType}</div>
          </div>
        </>
      )}

      {type === RecordTypeEnum.Claim && (
        <>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Chain</Trans>
            </div>
            <div className="text-sm text-white">{getChainInfo(item.chainId)?.label ?? '--'}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Hash</Trans>
            </div>
            <div className="text-sm text-white">
              <TransactionHash hash={item.txHash} />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-xs text-[#CED1D9]">
              <Trans>Amount</Trans>
            </div>
            <div className="text-sm text-white">
              {formatNumberPrecision(item.amount, 2)} {item.token}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const DesktopRecordItem = ({ type, item, copy, onStatistics }: any) => {
  return (
    <tr className="hover:bg-[#31333D]">
      <td className="py-3">
        {dayjs(
          type === RecordTypeEnum.Rebase
            ? item.rebateTime * 1000
            : type === RecordTypeEnum.Claim
              ? item.claimTime * 1000
              : item.createTime,
        ).format('YYYY-MM-DD HH:mm:ss')}
      </td>

      {type === RecordTypeEnum.Invite && (
        <>
          <td className="py-3">
            <div className="flex items-center gap-1">
              {encryptionAddress(item.referee)}
              <Copy
                size={14}
                className="cursor-pointer"
                onClick={() =>
                  copy(item.referee).then(
                    (rs: any) => rs && toast.success({ title: t`Copy success` }),
                  )
                }
              />
            </div>
          </td>
          <td className="py-3">{item.referrerRatio}%</td>
          <td className="py-3">{item.refereeRatio}%</td>
          <td className="py-3">{formatNumberPrecision(item.contribute, 2)}</td>
          <td className="py-3 text-right">
            <div
              className="flex cursor-pointer items-center justify-end gap-1 text-[#00E3A5]"
              onClick={() => onStatistics(item.referee)}
            >
              <Trans>Statistics</Trans>
              <ArrowRight size={14} />
            </div>
          </td>
        </>
      )}

      {type === RecordTypeEnum.Rebase && (
        <>
          <td className="py-3">
            <div className="flex items-center gap-1">
              {encryptionAddress(item.account)}
              <Copy
                size={14}
                className="cursor-pointer"
                onClick={() =>
                  copy(item.account).then(
                    (rs: any) => rs && toast.success({ title: t`Copy success` }),
                  )
                }
              />
            </div>
          </td>
          <td className="py-3">{getChainInfo(item.chainId)?.label ?? '--'}</td>
          <td className="py-3 text-right">
            {formatNumberPrecision(item.amount, 2)} {item.token}
          </td>
          <td className="py-3 text-right">{item.rebateType}</td>
        </>
      )}

      {type === RecordTypeEnum.Claim && (
        <>
          <td className="py-3">{getChainInfo(item.chainId)?.label ?? '--'}</td>
          <td className="py-3">
            <TransactionHash hash={item.txHash} />
          </td>
          <td className="py-3 text-right">
            {formatNumberPrecision(item.amount, 2)} {item.token}
          </td>
        </>
      )}
    </tr>
  )
}
