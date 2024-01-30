/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { DefaultTheme } from 'styled-components/native'

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    highlight: '#ffffff',
    primary: '#fcfdff',
    secondary: '#f1f4f9',
    tertiary: '#eff1f6',
    back1: '#f2f3f7',
    back2: '#f0f1f5',
    accent: 'rgba(58, 111, 244, 0.12)',
    contrast: '#212126'
  },
  font: {
    primary: '#171717',
    secondary: '#404040',
    tertiary: '#ababab',
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
    primary: 'rgba(36, 34, 32, 0.12)',
    secondary: 'rgba(36, 34, 32, 0.06)'
  },
  shadow: {
    primary: 'shadow-color: black; shadow-offset: 0px 2px; shadow-opacity: 0.03; shadow-radius: 2px; elevation: 2;',
    secondary: 'shadow-color: black; shadow-offset: 0px 10px; shadow-opacity: 0.04; shadow-radius: 10px; elevation: 5;',
    tertiary: 'shadow-color: black; shadow-offset: 0px 20px; shadow-opacity: 0.02; shadow-radius: 50px; elevation: 40;'
  },
  global: {
    accent: '#1575f9',
    alert: '#ed4a34',
    warning: '#f48826',
    valid: '#2DA023',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#b07dcb',
    send: '#f7aa54',
    receive: '#61b15b'
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
    tertiary: '#141417',
    back1: '#111114',
    back2: '#0E0E10',
    accent: 'rgba(93, 108, 243, 0.08)',
    contrast: '#ffffff'
  },
  font: {
    primary: '#E3E3E3',
    secondary: 'rgba(255, 255, 255, 0.75)',
    tertiary: 'rgba(255, 255, 255, 0.40)',
    contrast: '#171717',
    highlight: '#f0d590'
  },
  button: {
    primary: 'rgba(255, 255, 255, 0.075)',
    secondary: 'rgba(255, 255, 255, 0.04)',
    tertiary: '#28282b'
  },
  header: {
    hidden: colord('#242426').alpha(0).toHex(),
    visible: '#242426'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.12)',
    secondary: 'rgba(255, 255, 255, 0.06)'
  },
  shadow: {
    primary: 'shadow-color: black; shadow-offset: 0px 2px; shadow-opacity: 0.25; shadow-radius: 2px; elevation: 5;',
    secondary: 'shadow-color: black; shadow-offset: 0px 10px; shadow-opacity: 0.3; shadow-radius: 10px; elevation: 5;',
    tertiary: 'shadow-color: black; shadow-offset: 0px 25px; shadow-opacity: 0.2; shadow-radius: 25px; elevation: 5;'
  },
  global: {
    accent: '#2f8cef',
    alert: '#ed4a34',
    warning: '#ed882d',
    valid: '#3ed282',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#d488eb',
    send: '#fdb866',
    receive: '#71c56b'
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
