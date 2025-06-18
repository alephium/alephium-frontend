import { colord } from 'colord'
import { DefaultTheme } from 'styled-components/native'

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    highlight: 'rgba(0, 0, 0, 0.065)',
    primary: 'rgba(0, 0, 0, 0.05)',
    secondary: 'rgba(0, 0, 0, 0.04)',
    tertiary: 'rgba(0, 0, 0, 0.025)',
    back1: '#fff',
    back2: '#fff',
    accent: colord('#1485ea').alpha(0.1).toHex(),
    contrast: '#111114'
  },
  font: {
    primary: '#000',
    secondary: 'rgba(0, 0, 0, 0.75)',
    tertiary: 'rgba(0, 0, 0, 0.4)',
    contrast: '#ffffff',
    highlight: '#d4a10d'
  },
  button: {
    primary: 'rgba(0, 0, 0, 0.06)',
    secondary: 'rgba(0, 0, 0, 0.04)',
    tertiary: '#353539'
  },
  header: {
    hidden: colord('#e6e7eb').alpha(0).toHex(),
    visible: '#e6e7eb'
  },
  border: {
    primary: 'rgba(36, 34, 32, 0.1)',
    secondary: 'rgba(36, 34, 32, 0.06)'
  },
  shadow: {
    primary: 'shadow-color: black; shadow-offset: 0px 2px; shadow-opacity: 0.03; shadow-radius: 2px; elevation: 2;',
    secondary: 'shadow-color: black; shadow-offset: 0px 10px; shadow-opacity: 0.04; shadow-radius: 10px; elevation: 5;',
    tertiary: 'shadow-color: black; shadow-offset: 0px 20px; shadow-opacity: 0.02; shadow-radius: 50px; elevation: 40;'
  },
  global: {
    accent: '#1485ea',
    alert: '#ed4a34',
    warning: '#f48826',
    valid: '#20942d',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#b07dcb',
    send: '#f75d57',
    gray: 'rgb(145, 145, 145)',
    receive: '#61b15b',
    palette1: '#8ee4f9',
    palette2: '#ffd69f',
    palette3: '#8ec7ff',
    palette4: '#ffa7fa',
    palette5: '#ffa2bd',
    palette6: '#ffd691'
  },
  gradient: {
    yellow: '#FFCD82',
    orange: '#F95B50',
    red: '#EA3D74',
    purple: '#6A5DF8',
    cyan: '#49D2ED'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    highlight: '#353539',
    primary: '#1b1b1f',
    secondary: '#17171a',
    tertiary: '#121214',
    back1: '#0f0f12',
    back2: '#0a0a0d',
    accent: colord('#66a4fa').alpha(0.15).toHex(),
    contrast: '#E3E3E3'
  },
  font: {
    primary: '#E3E3E3',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrast: '#000',
    highlight: '#f0d590'
  },
  button: {
    primary: 'rgba(255, 255, 255, 0.07)',
    secondary: 'rgba(255, 255, 255, 0.04)',
    tertiary: '#28282b'
  },
  header: {
    hidden: colord('#242426').alpha(0).toHex(),
    visible: '#242426'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(255, 255, 255, 0.05)'
  },
  shadow: {
    primary: 'shadow-color: black; shadow-offset: 0px 2px; shadow-opacity: 0.25; shadow-radius: 2px; elevation: 5;',
    secondary: 'shadow-color: black; shadow-offset: 0px 10px; shadow-opacity: 0.3; shadow-radius: 10px; elevation: 5;',
    tertiary: 'shadow-color: black; shadow-offset: 0px 25px; shadow-opacity: 0.2; shadow-radius: 25px; elevation: 5;'
  },
  global: {
    accent: '#66a4fa',
    alert: '#ed4a34',
    warning: '#ed882d',
    valid: '#16a324',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#d488eb',
    send: '#fdb866',
    receive: '#71c56b',
    gray: 'rgb(121, 121, 121)',
    palette1: '#89cbff',
    palette2: '#ffeeb7',
    palette3: '#7d8dff',
    palette4: '#ef9cee',
    palette5: '#ff9db6',
    palette6: '#ffce97'
  },
  gradient: {
    yellow: '#FFCD82',
    orange: '#F95B50',
    red: '#EA3D74',
    purple: '#6A5DF8',
    cyan: '#49D2ED'
  }
}

export const themes = {
  light: lightTheme,
  dark: darkTheme
}
