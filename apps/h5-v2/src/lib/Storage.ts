export class Storage<T = string> {
  private storageKey: string
  constructor(storageKey: string) {
    this.storageKey = storageKey
  }

  get() {
    const value = localStorage.getItem(this.storageKey)
    if (value) {
      try {
        return JSON.parse(value) as T
      } catch (_) {
        // todo
      }
    }
    return value as T
  }
  set(value: T) {
    localStorage.setItem(this.storageKey, JSON.stringify(value))
  }
  remove() {
    localStorage.removeItem(this.storageKey)
  }
}
