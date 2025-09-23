export function getDecimalPlaces(value: string): number {
  return value.includes(".") ? value.split(".")[1].length : 0;
}
