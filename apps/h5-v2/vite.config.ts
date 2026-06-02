/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'
import { lingui } from '@lingui/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import process from 'node:process'
import fs from 'fs'
import dayjs from 'dayjs'

const input: { main: string; icon?: string } = {
  main: resolve(__dirname, 'index.html'),
}

if (process.env.NODE_ENV !== 'production') {
  input.icon = resolve(__dirname, 'icon.html')
}

// build time
const timezoneOffset = new Date().getTimezoneOffset() / 60
const timezone = `UTC${timezoneOffset <= 0 ? '+' : '-'}${Math.abs(timezoneOffset)}`
const buildTime = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} (${timezone})`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
    tailwindcss(),
    svgr(),
    // console build time
    {
      name: 'html-inject',
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: {
                type: 'text/javascript',
              },
              children: `console.log('Release time: ${buildTime}')`,
            },
          ],
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@public': path.resolve(__dirname, './public'),
    },
  },
  server: {
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },
    host: true,
    watch: {},
  },
  build: {
    rollupOptions: {
      input,
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['./test/**/*.test.ts', './test/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
