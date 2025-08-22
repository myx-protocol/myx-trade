import { wrapperEnv } from '../../vite/utils'

export enum RunEnvEnum {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
  DEV = 'dev',
  DEV_2 = 'dev_2',
  BETA = 'beta',
  STG = 'stg',
}

export function getCurrentEnv(): RunEnvEnum {
  return import.meta.env?.VITE_APP_APP_ENV as RunEnvEnum
}

export function isDevMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.DEVELOPMENT
}

export function isBetaMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.BETA
}

export function isProdMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.PRODUCTION || getCurrentEnv() === RunEnvEnum.STG
}

export function isUatMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.DEV
}

export function isDev2Mode(): boolean {
  return getCurrentEnv() === RunEnvEnum.DEV_2
}

export function isTestMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.TEST
}

export function isSTGMode(): boolean {
  return getCurrentEnv() === RunEnvEnum.STG
}

export function getAppEnvConfig(): ImportMetaEnvGlob {
  const ENV = import.meta.env as ImportMetaEnv

  const viteEnv = wrapperEnv(ENV)

  return viteEnv
}

export const isTestConclusionMode = false
