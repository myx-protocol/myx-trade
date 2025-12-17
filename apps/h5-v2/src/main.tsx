import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './css/tailwindcss.css'
import './css/swiper.css'
import './css/vip.css'
import { I18nProvider } from './locales/I18nProvider.tsx'
import { WalletProvider } from './providers/WalletProvider.tsx'
import { ParticleProvider } from './providers/ParticleProvider.tsx'
import { ThemeProvider } from '@mui/material'
import { theme } from '@/config/theme.ts'
import { Buffer } from 'buffer'
import './utils/time.ts'

if (!window.Buffer) {
  window.Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <ParticleProvider>
        <I18nProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </I18nProvider>
      </ParticleProvider>
    </WalletProvider>
  </StrictMode>,
)
