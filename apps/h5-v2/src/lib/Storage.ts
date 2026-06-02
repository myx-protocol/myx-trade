type StorageProvider = typeof localStorage | typeof sessionStorage

export class Storage<T = string> {
  private storageKey: string
  private provider: StorageProvider
  constructor(storageKey: string, provider = localStorage) {
    this.storageKey = storageKey
    this.provider = provider
  }

  get() {
    const value = this.provider.getItem(this.storageKey)
    if (value) {
      try {
        return JSON.parse(value) as T | null
      } catch (_) {
        // todo
      }
    }
    return value as T
  }
  set(value: T) {
    this.provider.setItem(this.storageKey, JSON.stringify(value))
  }
  remove() {
    this.provider.removeItem(this.storageKey)
  }
}
