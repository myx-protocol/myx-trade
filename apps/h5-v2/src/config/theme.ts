import { alpha, createTheme } from '@mui/material'
import { DarkColor } from './color.ts'

declare module '@mui/material/styles' {
  interface Theme {
    color: IColor
  }

  interface ThemeOptions {
    color: IColor
  }

  interface PaletteColor {
    hover?: string
    disabled?: string
    disabledText?: string
  }

  interface SimplePaletteColorOptions {
    hover?: string
    disabled?: string
    disabledText?: string
  }

  interface Palette {
    default: PaletteColor
  }

  interface PaletteOptions {
    default: SimplePaletteColorOptions
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    default: true
  }
}

export const theme = createTheme({
  color: DarkColor,
  typography: {
    fontFamily:
      "HarmonyOS, HarmonyOS_SC, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif",
  },
  palette: {
    primary: {
      main: DarkColor.BgColorUp,
    },
    default: {
      main: DarkColor.borderDark,
      contrastText: DarkColor.TextColor00,
      disabled: alpha(DarkColor.borderDark, 0.3),
      disabledText: DarkColor.thirdText,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
})
