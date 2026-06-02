import { appStorage } from '@/utils/storage'

export enum ExecutionProgressState {
  InProgress = 1,
  Cancel = 3,
  Finalized = 9,
}

export enum ExecTypeEnum {
  Complete,
  Expired,
  Cancel,
}

export type OnExecutionResultCallback = (data: {
  state?: ExecutionProgressState
  execType: ExecTypeEnum
}) => void

const PROGRESS_INTERVAL = 1000 * 2

export class ExecutionProgress {
  public isRunning = false

  constructor(
    private fetchRecord: () => Promise<number>,
    private onCallback: OnExecutionResultCallback,
    private chainId: number,
    private poolId: string,
    private txId: string,
    private expireTime = 1000 * 60 * 2,
  ) {}

  private beforeCheckResultByCache() {
    const cache = appStorage.executionResult.get()
    if (cache) {
      const cacheRecordState = cache[this.chainId]?.[this.poolId]?.[this.txId] ?? null
      return cacheRecordState
    }
    return null
  }

  private startTime = 0

  private updateCache(recordState: number) {
    const cache = appStorage.executionResult.get() ?? {}
    if (cache?.[this.chainId]?.[this.poolId]) {
      cache[this.chainId][this.poolId][this.txId] = recordState
    } else {
      cache[this.chainId] = {
        ...cache[this.chainId],
        [this.poolId]: {
          [this.txId]: recordState,
        },
      }
    }
    appStorage.executionResult.set(cache)
  }

  private stopProgress(type: ExecTypeEnum, state?: ExecutionProgressState) {
    if (!this.isRunning) return
    this.isRunning = false
    clearTimeout(this._timer as any)
    this._timer = null
    this.onCallback({
      state,
      execType: type,
    })
  }

  private _timer: Timeout | null = null
  private async doFetchRecord() {
    clearTimeout(this._timer as any)
    const recordState = await this.fetchRecord()
    const now = Date.now()
    const elapsedTime = now - this.startTime
    if (elapsedTime > this.expireTime) {
      return this.stopProgress(ExecTypeEnum.Expired)
    }
    if (!recordState || recordState === ExecutionProgressState.InProgress) {
      this._timer = setTimeout(() => {
        this.doFetchRecord()
      }, PROGRESS_INTERVAL)
      return null
    }
    this.updateCache(recordState)
    this.stopProgress(ExecTypeEnum.Complete, recordState)
  }

  async start(): Promise<void> {
    this.isRunning = true
    const cacheRecordState = this.beforeCheckResultByCache()
    if (cacheRecordState) {
      return this.stopProgress(ExecTypeEnum.Complete, cacheRecordState)
    }
    this.startTime = Date.now()
    this.doFetchRecord()
  }

  public cancel() {
    this.stopProgress(ExecTypeEnum.Cancel)
  }
}
