import { colord } from 'colord'
import { createGlobalStyle, css } from 'styled-components'
import normalize from 'styled-normalize'

// Breakpoints

export const deviceSizes = {
  tiny: 400,
  mobile: 600,
  tablet: 800,
  laptop: 1200,
  desktop: 1600
}

export const deviceBreakPoints = Object.entries(deviceSizes).reduce<{ [Key in keyof typeof deviceSizes]?: number }>(
  (a, s) => ({
    ...a,
    [s[0]]: `(max-width: ${s[1]}px)`
  }),
  {}
)

export default createGlobalStyle`
  ${normalize}

  * {
    box-sizing: border-box;
  }

  :root {
    font-size: 13px;

    @media ${deviceBreakPoints.tiny} {
      font-size: 12px;
    }
  }

  body {
    transition: background-color 0.2s ease;
    overflow-y: auto;
    overflow-x: hidden;
    
    color: ${({ theme }) => theme.font.primary};
    background-color: ${({ theme }) => theme.bg.background1};
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.global.accent};
    cursor: pointer;

    &:hover {
      color: ${({ theme }) =>
        theme.name === 'dark'
          ? colord(theme.global.accent).lighten(0.1).toHex()
          : colord(theme.global.accent).darken(0.2).toHex()};
    }
  }

  // Titles
  h2 {
    font-weight: 600;
    font-size: 1.6rem;
    margin-bottom: 15px;
  }

  // Animations
  @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
  }

  /* Additional resets */

  button {
    outline: none;
    cursor: pointer;
    border: none;
  }

  a {
    text-decoration: none;
  }

  input {
    outline: none;
  }

  th {
    font-weight: normal;
  }

  /* Apex charts */
  .apexcharts-canvas {
    tspan {
      font-family: 'Geist' !important;
    }
    font-feature-settings: "tnum";
  }

  .apexcharts-tooltip {
    box-shadow: ${({ theme }) => theme.shadow.primary} !important;
    border-radius: 8px !important;
    border: 1px solid ${({ theme }) => theme.border.primary};
  }
`

export const blurredBackground = (color: string) => css`
  background-color: ${colord(color).alpha(0.96).toRgbString()};

  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px);
    background-color: ${colord(color).alpha(0.7).toRgbString()};
  }
`
