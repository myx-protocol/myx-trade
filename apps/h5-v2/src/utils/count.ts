export class Count {
  private count: number = 0

  constructor() {
    this.count = 0
  }

  public increment() {
    this.count++
  }

  public decrement() {
    this.count--
  }

  public valueOf() {
    return this.count
  }
}
