import { colord } from 'colord'
import { createGlobalStyle } from 'styled-components'

import resets from '@/style/resets'
import { platform } from '@/utils/platform.ts'

export const appHeaderHeightPx = platform.isMac ? 50 : 102
export const walletSidebarWidthPx = 69
export const messagesLeftMarginPx = 70
export const sidebarExpandThresholdPx = 1300

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
    --radius-medium: 9px;
    --radius-big: 12px;
    --radius-huge: 22px;
    --radius-full: 100%;

    --fontWeight-normal: 400;
    --fontWeight-medium: 500;
    --fontWeight-semiBold: 600;
    --fontWeight-bold: 700;

    --inputHeight: 40px;
    --tableCellHeight: 46px;
    --toggleWidth: 52px;
  }

  html {
    ${electronWindowDimensions}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.primary};
    font-weight: var(--fontWeight-medium);
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
