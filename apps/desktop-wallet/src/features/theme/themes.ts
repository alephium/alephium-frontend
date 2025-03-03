import { colord } from 'colord'
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: 'rgba(0, 0, 0, 0.04)',
    secondary: 'rgba(0, 0, 0, 0.03)',
    tertiary: 'rgba(0, 0, 0, 0.015)',
    contrast: '#080808',
    background1: '#fff',
    background2: '#fcfcfc',
    hover: 'rgba(0, 0, 0, 0.01)',
    highlight: '#f4f4f4',
    accent: colord('#0045ff').alpha(0.02).toHex()
  },
  font: {
    primary: '#050505',
    secondary: 'rgba(0, 0, 0, 0.6)',
    tertiary: 'rgba(0, 0, 0, 0.4)',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ef6c5c',
    accent: colord('#0045ff').darken(0.2).toHex()
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.08)',
    secondary: 'rgba(0, 0, 0, 0.05)'
  },
  shadow: {
    primary: '0 8px 15px rgba(0, 0, 0, 0.2)',
    secondary: '0 4px 8px rgba(0, 0, 0, 0.03)',
    tertiary: '0 0 30px rgba(0, 0, 0, 0.1)'
  },
  global: {
    accent: '#0045ff',
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
    contrast: '#f2f2f2',
    background1: '#0c0c0d',
    background2: '#0a0a0a',
    hover: 'rgba(255, 255, 255, 0.015)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    accent: colord('#4a69ff').alpha(0.06).toHex()
  },
  font: {
    primary: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f06f5f',
    accent: colord('#4a69ff').lighten(0.1).toHex()
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.07)',
    secondary: 'rgba(255, 255, 255, 0.04)'
  },
  shadow: {
    primary: '0 8px 15px rgba(0, 0, 0, 1)',
    secondary: '0 10px 20px rgba(0, 0, 0, 0.2)',
    tertiary: '0 0 80px 30px rgba(0, 0, 0, 0.9)'
  },
  global: {
    accent: '#4a69ff',
    complementary: '#d488eb',
    alert: '#ed4a34',
    valid: '#7aca9b',
    highlight: '#f0d590',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
