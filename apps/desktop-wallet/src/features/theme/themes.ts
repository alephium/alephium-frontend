import { colord } from 'colord'
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: 'rgba(0, 0, 0, 0.04)',
    secondary: 'rgba(0, 0, 0, 0.03)',
    tertiary: 'rgba(0, 0, 0, 0.02)',
    contrast: '#000',
    background1: '#fff',
    background2: '#fafafa',
    hover: 'rgba(0, 0, 0, 0.01)',
    highlight: '#ffffff',
    accent: colord('#1535e9').alpha(0.05).toHex()
  },
  font: {
    primary: '#000',
    secondary: 'rgba(0, 0, 0, 0.6)',
    tertiary: 'rgba(0, 0, 0, 0.4)',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ef6c5c',
    accent: colord('#400fe3').darken(0.2).toHex()
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.08)',
    secondary: 'rgba(0, 0, 0, 0.04)'
  },
  shadow: {
    primary: '0 0 30px rgba(0, 0, 0, 0.02)',
    secondary: '0 8px 20px rgba(0, 0, 0, 0.1)',
    tertiary: '0 0 80px rgba(0, 0, 0, 0.2)'
  },
  global: {
    accent: '#400fe3',
    complementary: '#f174b3',
    alert: '#e52437',
    valid: '#189b3c',
    highlight: '#e5ae0e',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: 'rgba(255, 255, 255, 0.03)',
    secondary: 'rgba(255, 255, 255, 0.02)',
    tertiary: 'rgba(255, 255, 255, 0.01)',
    contrast: 'rgba(255, 255, 255, 1)',
    background1: '#121213',
    background2: '#0e0e0f',
    hover: 'rgba(255, 255, 255, 0.015)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    accent: colord('#3b62f0').alpha(0.1).toHex()
  },
  font: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f0a990',
    accent: colord('#3b62f0').lighten(0.1).toHex()
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.05)',
    secondary: 'rgba(255, 255, 255, 0.02)'
  },
  shadow: {
    primary: 'none',
    secondary: '0 10px 20px rgba(0, 0, 0, 0.2)',
    tertiary: '0 0 80px 30px rgb(0, 0, 0)'
  },
  global: {
    accent: '#3b46f0',
    complementary: '#d488eb',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlight: '#f0d590',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
