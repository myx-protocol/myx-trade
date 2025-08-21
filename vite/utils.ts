/**
 * @description: Read all environment variables configuration files and format the corresponding types
 */
export function wrapperEnv(envConf: Record<string, any>): ImportMetaEnv {
  const ret: any = {}

  for (const envName of Object.keys(envConf)) {
    const envValue = envConf[envName]

    // To number type
    const NUMBER_TYPE_KEYS: string[] = ['VITE_GLOB_CHAIN_ID']
    if (NUMBER_TYPE_KEYS.includes(envName)) {
      ret[envName] = Number(envValue)
      continue
    }

    // JSON to object type
    const JSON_TYPE_KEYS = ['VITE_GLOB_PROXY']
    if (JSON_TYPE_KEYS.includes(envName)) {
      try {
        ret[envName] = JSON.parse(envValue)
      } catch {
        console.log('viteEnv to object error')
      }
      continue
    }

    // To boolean type
    ret[envName] = envValue === 'true' ? true : envValue === 'false' ? false : envValue
  }

  return ret
}
