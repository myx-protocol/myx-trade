import { Address } from "viem"

export interface AppealVoteParams {
    caseId: number
    validator: Address
    isFor: boolean
    deadline: number
    v: number
    r: string
    s: string
}