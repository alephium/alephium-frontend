/*
Copyright 2018 - 2022 The Alephium Authors
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

import { DefaultTheme } from 'styled-components/native'

export type ThemeType = 'light' | 'dark'

export const lightTheme: DefaultTheme = {
  name: 'light',
  bg: {
    highlight: '#ffffff',
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f6f6f6',
    back1: '#F5F5F5',
    back2: '#F3F3F3',
    accent: 'rgba(93, 108, 243, 0.08)',
    contrast: '#212126'
  },
  font: {
    primary: '#171717',
    secondary: '#595959',
    tertiary: '#ababab',
    contrast: '#ffffff',
    highlight: '#d4a10d'
  },
  button: {
    primary: 'rgba(0, 0, 0, 0.06)',
    secondary: 'rgba(0, 0, 0, 0.04)',
    tertiary: '#353539'
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
    accent: '#3A7AF4',
    alert: '#ed4a34',
    valid: '#2DA023',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#b07dcb',
    send: '#f7654b',
    receive: '#3396fa'
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
    primary: '#1e1e21',
    secondary: '#18181b',
    tertiary: '#19191c',
    back1: '#151519',
    back2: '#0E0E10',
    accent: 'rgba(93, 108, 243, 0.08)',
    contrast: 'white'
  },
  font: {
    primary: '#E3E3E3',
    secondary: 'rgba(255, 255, 255, 0.75)',
    tertiary: 'rgba(255, 255, 255, 0.40)',
    contrast: '#19191E',
    highlight: '#f0d590'
  },
  button: {
    primary: '#29292d',
    secondary: '#1d1d20',
    tertiary: '#28282b'
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
    valid: '#3ed282',
    star: '#FFD66D',
    pale: '#f7d1b6',
    complementary: '#d488eb',
    send: '#fd9166',
    receive: '#7fcef8'
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
