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
import { createGlobalStyle } from 'styled-components'

import resets from '@/style/resets'

export const appHeaderHeightPx = 72
export const walletSidebarWidthPx = 76
export const messagesLeftMarginPx = 70

const electronWindowDimensions = `
  height: 100%;
`

export const GlobalStyle = createGlobalStyle`
  ${resets}

  :root {
    --color-white: #fff;
    --color-grey: #646775;

    /* spacial system of 5px linear scale */
    --spacing-1: 5px;
    --spacing-2: 10px;
    --spacing-3: 15px;
    --spacing-4: 20px;
    --spacing-5: 25px;
    --spacing-6: 30px;
    --spacing-7: 35px;
    --spacing-8: 40px;

    --radius-tiny: 4px;
    --radius-small: 6px;
    --radius-medium: 8px;
    --radius-big: 10px;
    --radius-huge: 18px;
    --radius-full: 100%;

    --fontWeight-normal: 400;
    --fontWeight-medium: 500;
    --fontWeight-semiBold: 600;
    --fontWeight-bold: 700;

    --inputHeight: 44px;
    --tableCellHeight: 46px;
    --toggleWidth: 52px;
  }

  html {
    ${electronWindowDimensions}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
  }

  .skeleton-loader {
    background-image: linear-gradient(-90deg, rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
    background-size: 400% 400%;
    animation: gradientAnimation 1.5s ease-in-out infinite;

    @keyframes gradientAnimation {
      0% {
        background-position: 0% 0%;
      }
      100% {
        background-position: -135% 0%;
      }
    }
  }

  .rcs-inner-handle {
    color: white;
    background-color: ${({ theme }) =>
      colord(theme.font.tertiary)
        .alpha(theme.name === 'light' ? 0.1 : 0.15)
        .toHex()} !important;
  }
`

// Breakpoints

export const deviceSizes = {
  mobile: 800,
  tablet: 1000,
  desktop: 1600
}

export const deviceBreakPoints = {
  mobile: `(max-width: ${deviceSizes.mobile}px)`,
  tablet: `(max-width: ${deviceSizes.tablet}px)`,
  desktop: `(max-width: ${deviceSizes.desktop}px)`,
  short: '(max-height: 600px)'
}
