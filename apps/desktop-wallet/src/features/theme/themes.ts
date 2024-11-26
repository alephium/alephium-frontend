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
import { DefaultTheme } from 'styled-components'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#fff',
    secondary: '#fafafa',
    tertiary: '#f7f7f7',
    contrast: '#000',
    background1: '#fafafa',
    background2: '#fafafa',
    hover: colord('#ffffff').darken(0.008).toHex(),
    highlight: '#f5f5f5',
    accent: colord('#3d6fec').alpha(0.15).toHex()
  },
  font: {
    primary: '#00001d',
    secondary: '#000026',
    tertiary: '#8a8a99',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ef6c5c'
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.06)',
    secondary: 'rgba(0, 0, 0, 0.04)'
  },
  shadow: {
    primary: '0 1px 1px rgba(0, 0, 0, 0.03)',
    secondary: '0 8px 10px rgba(0, 0, 0, 0.1)',
    tertiary: '0 0 50px rgba(0, 0, 0, 0.15)'
  },
  global: {
    accent: '#3d6fec',
    complementary: '#b07dcb',
    alert: '#e53b24',
    valid: '#189b3c',
    highlight: '#e5ae0e',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#121214',
    secondary: '#101012',
    tertiary: '#0e0e0f',
    contrast: 'rgba(255, 255, 255, 1)',
    background1: '#0b0b0d',
    background2: '#0b0b0d',
    hover: colord('#18181a').lighten(0.02).toHex(),
    highlight: '#25252b',
    accent: colord('#487df0').alpha(0.12).toHex()
  },
  font: {
    primary: '#e3e3e3',
    secondary: '#c0c0c0',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f0a990'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.06)',
    secondary: 'rgba(255, 255, 255, 0.04)'
  },
  shadow: {
    primary: '0 2px 3px rgba(0, 0, 0, 0.3)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.25)',
    tertiary: '0 0 50px rgb(0, 0, 0)'
  },
  global: {
    accent: '#487df0',
    complementary: '#d488eb',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlight: '#f0d590',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
