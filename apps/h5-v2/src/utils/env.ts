export function getCurrentEnv() {
  return import.meta.env?.VITE_APP_APP_ENV
}

export function isDevMode(): boolean {
  return getCurrentEnv() === 'development'
}

export function isBetaMode(): boolean {
  return getCurrentEnv() === 'beta'
}

export function isProdMode(): boolean {
  return getCurrentEnv() === 'production' || getCurrentEnv() === 'stg'
}

export function isUatMode(): boolean {
  return getCurrentEnv() === 'dev'
}

export function isDev2Mode(): boolean {
  return getCurrentEnv() === 'dev_2'
}

export function isTestMode(): boolean {
  return getCurrentEnv() === 'test'
}

export function isSTGMode(): boolean {
  return getCurrentEnv() === 'stg'
}

export const isTestConclusionMode = false
