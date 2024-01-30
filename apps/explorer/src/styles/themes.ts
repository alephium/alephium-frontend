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

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    primary: '#ffffff',
    secondary: '#F9F9F9',
    tertiary: '#f4f4f4',
    hover: 'rgba(0, 0, 0, 0.012)',
    contrast: '#212126',
    accent: colord('#5981f3').alpha(0.15).toRgbString(),
    background1: '#F0F0F0',
    background2: '#F0F0F0'
  },
  font: {
    primary: '#242424',
    secondary: '#6a6a6a',
    tertiary: '#adadad',
    contrastPrimary: 'rgba(255, 255, 255, 1)',
    contrastSecondary: 'rgba(255, 255, 255, 0.8)',
    highlight: '#f67460'
  },
  border: {
    primary: '#e3e3e3',
    secondary: '#f1f1f1'
  },
  shadow: {
    primary: '0 2px 2px rgba(0, 0, 0, 0.03)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.04)',
    tertiary: '0 0 50px rgba(0, 0, 0, 0.3)'
  },
  global: {
    accent: '#5981f3',
    complementary: '#ce5cf8',
    alert: '#da3341',
    warning: '#ffa600',
    valid: '#028f54',
    highlight: '#f78c14',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  bg: {
    primary: '#1B1B1F',
    secondary: '#18181B',
    tertiary: '#141417',
    hover: 'rgba(255, 255, 255, 0.02)',
    contrast: 'white',
    accent: colord('#598BED').alpha(0.15).toRgbString(),
    background1: '#121215',
    background2: '#0E0E10'
  },
  font: {
    primary: '#e3e3e3',
    secondary: '#C0C0C0',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    contrastPrimary: 'rgba(0, 0, 0, 1)',
    contrastSecondary: 'rgba(0, 0, 0, 0.8)',
    highlight: '#f37975'
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)'
  },
  shadow: {
    primary: '0 4px 4px rgba(0, 0, 0, 0.25)',
    secondary: '0 10px 10px rgba(0, 0, 0, 0.3)',
    tertiary: '0 0 50px rgb(0, 0, 0)'
  },
  global: {
    accent: '#598BED',
    complementary: '#eb88a4',
    alert: '#f24242',
    warning: '#ffc42d',
    valid: '#1dcd84',
    highlight: '#f78c14',
    highlightGradient: 'linear-gradient(45deg, rgba(18,0,218,1) 0%, rgba(255,93,81,1) 100%)'
  }
}
