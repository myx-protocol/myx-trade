export type InputType = 'address' | 'symbol' | 'name' | 'unknown'

export function detectInputType(input: string): InputType {
  const value = input.trim()

  if (!value) return 'unknown'

  // ① 合约地址：0x + 40位 hex
  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(value)
  if (isAddress) return 'address'

  // ② Symbol: 全大写 + 不含空格（允许数字）
  const isSymbol = /^[A-Z0-9]{2,10}$/.test(value)
  if (isSymbol) return 'symbol'

  // ③ 名称：字母开头，允许空格、小写
  const isName = /^[a-zA-Z][a-zA-Z0-9\s.-]{1,30}$/.test(value)
  if (isName) return 'name'

  return 'unknown'
}
