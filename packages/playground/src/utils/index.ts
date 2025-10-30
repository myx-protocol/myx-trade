export const encryptionAddress = (address?: string, start = 6, end = 4) => {
  if (!address) return ''
  return `${address.slice(0, Math.max(0, start)).toLowerCase()}...${address.slice(-end).toLowerCase()}`
}
