import 'styled-components'

import { ThemeType } from '~/style/themes'

declare module 'styled-components/native' {
  export interface DefaultTheme {
    name: ThemeType
    bg: {
      highlight: string
      primary: string
      secondary: string
      tertiary: string
      back1: string
      back2: string
      accent: string
      contrast: string
    }
    font: {
      primary: string
      secondary: string
      tertiary: string
      contrast: string
      highlight: string
    }
    button: {
      primary: string
      secondary: string
      tertiary: string
    }
    header: {
      hidden: string
      visible: string
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
      alert: string
      warning: string
      valid: string
      star: string
      pale: string
      complementary: string
      send: string
      receive: string
    }
    gradient: {
      yellow: string
      orange: string
      red: string
      purple: string
      cyan: string
    }
  }
}
