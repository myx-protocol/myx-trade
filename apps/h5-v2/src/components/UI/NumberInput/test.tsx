import { useState } from 'react'
import { NumberInputPrimitive } from './NumberInputPrimitive'

// 测试修改后的 NumberInputPrimitive 组件
export const NumberInputTest = () => {
  const [value, setValue] = useState('5')
  const [floatValue, setFloatValue] = useState(5)

  const handleValueChange = (values: {
    floatValue: number | undefined
    value: string
    formattedValue: string
  }) => {
    console.log('NumberInputPrimitive values:', values)
    setValue(values.value)
    setFloatValue(values.floatValue || 0)
  }

  return (
    <div className="min-h-screen bg-[#18191F] p-8">
      <h2 className="mb-8 text-2xl text-white">NumberInputPrimitive 测试</h2>

      <div className="space-y-6">
        <div className="rounded-lg bg-[#1A1B23] p-6">
          <h3 className="mb-4 text-lg text-white">基础 NumberInputPrimitive</h3>
          <div className="flex items-center gap-2">
            <NumberInputPrimitive
              value={value}
              onValueChange={handleValueChange}
              allowNegative={false}
              decimalScale={0}
              thousandSeparator=""
              inputMode="decimal"
              className="w-32 rounded border border-[#31333D] bg-transparent px-2 py-1 text-center text-lg font-semibold text-white outline-none"
              placeholder="0"
            />
            <span className="text-[#848E9C]">x</span>
          </div>
          <div className="mt-2 text-sm text-[#848E9C]">
            <p>Value: {value}</p>
            <p>Float Value: {floatValue}</p>
          </div>
        </div>

        <div className="rounded-lg bg-[#1A1B23] p-6">
          <h3 className="mb-4 text-lg text-white">带千分位分隔符</h3>
          <NumberInputPrimitive
            value={value}
            onValueChange={handleValueChange}
            allowNegative={false}
            decimalScale={0}
            thousandSeparator=","
            inputMode="decimal"
            className="w-32 rounded border border-[#31333D] bg-transparent px-2 py-1 text-center text-lg font-semibold text-white outline-none"
            placeholder="0"
          />
        </div>

        <div className="rounded-lg bg-[#1A1B23] p-6">
          <h3 className="mb-4 text-lg text-white">带小数位</h3>
          <NumberInputPrimitive
            value={value}
            onValueChange={handleValueChange}
            allowNegative={false}
            decimalScale={2}
            thousandSeparator=""
            inputMode="decimal"
            className="w-32 rounded border border-[#31333D] bg-transparent px-2 py-1 text-center text-lg font-semibold text-white outline-none"
            placeholder="0.00"
          />
        </div>

        <div className="rounded-lg bg-[#1A1B23] p-6">
          <h3 className="mb-4 text-lg text-white">带最大值限制</h3>
          <NumberInputPrimitive
            value={value}
            onValueChange={handleValueChange}
            allowNegative={false}
            decimalScale={0}
            thousandSeparator=""
            inputMode="decimal"
            max={50}
            className="w-32 rounded border border-[#31333D] bg-transparent px-2 py-1 text-center text-lg font-semibold text-white outline-none"
            placeholder="0"
          />
          <p className="mt-2 text-sm text-[#848E9C]">最大值: 50</p>
        </div>
      </div>
    </div>
  )
}

export default NumberInputTest
