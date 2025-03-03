import 'styled-components'

import { ThemeType } from './themes'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      primary: string
      secondary: string
      tertiary: string
      hover: string
      contrast: string
      accent: string
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
      warning: string
      valid: string
      highlight: string
      highlightGradient: string
    }
  }
}
