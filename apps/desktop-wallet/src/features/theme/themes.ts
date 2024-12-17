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
    primary: 'rgba(0, 0, 0, 0.04)',
    secondary: 'rgba(0, 0, 0, 0.03)',
    tertiary: 'rgba(0, 0, 0, 0.02)',
    contrast: '#000',
    background1: '#fff',
    background2: '#fafafa',
    hover: 'rgba(0, 0, 0, 0.01)',
    highlight: 'rgba(0, 0, 0, 0.05)',
    accent: colord('#0f22e3').alpha(0.05).toHex()
  },
  font: {
    primary: '#000014',
    secondary: '#000026',
    tertiary: 'rgba(0, 0, 0, 0.4)',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#ef6c5c'
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.09)',
    secondary: 'rgba(0, 0, 0, 0.06)'
  },
  shadow: {
    primary: '0 1px 1px rgba(0, 0, 0, 0.03)',
    secondary: '0 8px 10px rgba(0, 0, 0, 0.1)',
    tertiary: '0 0 80px rgba(0, 0, 0, 0.2)'
  },
  global: {
    accent: '#0f22e3',
    complementary: '#b07dcb',
    alert: '#e52437',
    valid: '#189b3c',
    highlight: '#e5ae0e',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: 'rgba(255, 255, 255, 0.04)',
    secondary: 'rgba(255, 255, 255, 0.03)',
    tertiary: 'rgba(255, 255, 255, 0.02)',
    contrast: 'rgba(255, 255, 255, 1)',
    background1: '#0d0d0f',
    background2: '#070708',
    hover: 'rgba(255, 255, 255, 0.01)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    accent: colord('#3b62f0').alpha(0.1).toHex()
  },
  font: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f0a990'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.06)'
  },
  shadow: {
    primary: '0 2px 3px rgba(0, 0, 0, 0.3)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.25  )',
    tertiary: '0 0 80px 30px rgb(0, 0, 0)'
  },
  global: {
    accent: '#3b62f0',
    complementary: '#d488eb',
    alert: '#ed4a34',
    valid: '#3ed282',
    highlight: '#f0d590',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
