export { http } from './http.ts'
const { VITE_GLOB_API_URL } = import.meta.env
export const baseUrl = VITE_GLOB_API_URL
// todo 20
export const DEFAULT_LIMIT = 20

export * from './lp'
