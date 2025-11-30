import './css/tailwindcss.css'
import { createRoot } from 'react-dom/client'
import { ICON_KEYS, getIcon } from '@/components/Icon'
import { useState } from 'react'
import type { IconKey } from '@/components/Icon/types.ts'

const root = createRoot(document.getElementById('root') as HTMLElement) // 因为我webpack定义的模板html有个root，所以这样写，因人而异了

function capitalizeFirstLetter(string: string) {
  if (!string) return string
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

// eslint-disable-next-line react-refresh/only-export-components
const IconPage = () => {
  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    // toast.success(`复制成功: ${value}`);
  }

  const [type] = useState('js')

  return (
    <div className="p-2 font-mono">
      {/*<Toaster />*/}
      <div className="my-2">
        {/*<RadioButton*/}
        {/*  value={type}*/}
        {/*  onChange={handleChange}*/}
        {/*  options={[*/}
        {/*    { value: 'component', label: '使用组件' },*/}
        {/*    { value: 'js', label: '使用js' },*/}
        {/*  ]}*/}
        {/*/>*/}
        <div className="flex justify-center space-x-2">
          {type === 'component' ? (
            <div className="min-w-[430px] border bg-slate-900 p-2 text-slate-50">
              {`import { ChartIcon } from '@/components/Icon'; `}
              <br />
              <br />
              {` <ChartIcon type="primary" size={16}/> `}
            </div>
          ) : (
            <div className="w-fit min-w-[430px] border bg-slate-900 p-2 text-slate-50">
              {`import { getIcon } from '@/components/Icon'; `}
              <br />
              <br />
              {` <div> { getIcon('ChartIcon', { type:'primary', size: 16 }) } </div> `}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-8">
        {ICON_KEYS.map((key) => {
          const value = type === 'component' ? `${capitalizeFirstLetter(key)}Icon` : key
          return (
            <div
              className="hover:text-deep flex cursor-pointer flex-col items-center justify-center rounded-sm pt-4 text-white shadow-sm transition duration-300 ease-out hover:scale-105 hover:bg-indigo-100"
              onClick={handleCopy.bind(null, `<${value} size={}/>`)}
              key={key}
            >
              {getIcon(key as IconKey, {
                type: 'primary',
                size: 20,
              })}
              <span className="text mt-0.5 select-none">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

root.render(<IconPage />)
