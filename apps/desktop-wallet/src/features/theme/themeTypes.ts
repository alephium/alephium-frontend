import 'styled-components'

export type ThemeType = 'light' | 'dark'

export type ThemeSettings = ThemeType | 'system'

declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      primary: string
      secondary: string
      tertiary: string
      contrast: string
      accent: string
      hover: string
      highlight: string
      background1: string
      background2: string
    }
    font: {
      primary: string
      secondary: string
      tertiary: string
      contrastPrimary: string
      contrastSecondary: string
      highlight: string
    }
    shadow: {
      primary: string
      secondary: string
      tertiary: string
    }
    border: {
      primary: string
      secondary: string
    }
    global: {
      accent: string
      complementary: string
      alert: string
      valid: string
      highlightGradient: string
      highlight: string
    }
  }
}
