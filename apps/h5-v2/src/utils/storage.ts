import { Storage } from '@/lib/Storage'

export interface IExecutionResultStorage {
  [chainId: number]: {
    [poolId: string]: {
      [txId: string]: number // state: InProgress = 1, Cancel = 3, Finalized = 9
    }
  }
}

export const appStorage = {
  studyTemplate: new Storage<any>('MYX_TV_STUDY_TEMPLATE'),
  executionResult: new Storage<IExecutionResultStorage>('MYX_EXECUTION_RESULT', sessionStorage),
}
