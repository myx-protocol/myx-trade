export enum ScreenType {
  xs = 'xs',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
}

export const Screens: IScreen = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 976,
  xl: 1440,
}

const _Tailwind: {
  [x: string]: string
} = {}

Object.entries(Screens).forEach(([key, value]) => {
  _Tailwind[key] = `${value}px`
})

export const TailwindScreens = _Tailwind

export const BREAKPOINTS = {
  sm: 639,
  md: 767,
  lg: 979,
  xl: 1279,
  xxl: 1439,
  xxk: 2559,
  xxxxk: 3349,
}
