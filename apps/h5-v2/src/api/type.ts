export interface ApiResponse<T = Record<string, any> | null> {
  code: number
  msg: string
  data: T
}
