export const resolution = [1, 5, 15, 30, 60, 240, '1D', '1W', '1M']

export const resolutionDefaultList: (string | number)[] = [5, 15, 60, 240]

export const dropDownMenuOptions = resolution.filter((item) => {
  if (!resolutionDefaultList.includes(item)) return item
  return undefined
})

export const Colors = {
  down: '#EC605A',
  down2: '#993E3A',
  up: '#00E3A5',
  up2: '#008C66',
}
