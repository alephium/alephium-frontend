import { colord } from 'colord'
import { createGlobalStyle } from 'styled-components'

import resets from '@/style/resets'

export const appHeaderHeightPx = 40
export const walletSidebarWidthPx = 69
export const messagesLeftMarginPx = 70
export const sidebarExpandThresholdPx = 1100

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
    --radius-small: 7px;
    --radius-medium: 8px;
    --radius-big: 10px;
    --radius-huge: 16px;
    --radius-full: 100%;

    --fontWeight-normal: 400;
    --fontWeight-medium: 500;
    --fontWeight-semiBold: 550;
    --fontWeight-bold: 650;

    --inputHeight: 36px;
    --tableCellHeight: 42px;
    --toggleWidth: 46px;
  }

  html {
    ${electronWindowDimensions}
  }

  body {
    color: ${({ theme }) => theme.font.primary};
    background-color: transparent;
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

  // Custom scrollbars theme
  .rcs-inner-handle {
    color: white;
    width: 5px;
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
