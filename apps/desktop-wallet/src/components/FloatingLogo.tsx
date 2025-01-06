import styled from 'styled-components'

import { ReactComponent as AlephiumLogoSVG } from '@/images/alephium_logo_monochrome.svg'
import { deviceBreakPoints } from '@/style/globalStyles'

export default styled(AlephiumLogoSVG)<{ position?: 'top' | 'bottom' }>`
  position: fixed;
  left: var(--spacing-5);
  width: 35px;
  height: auto;
  ${({ position }) => (position === 'bottom' ? 'bottom: var(--spacing-5)' : 'top: 50px')};

  path {
    fill: ${({ theme }) =>
      (theme.name === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)') + ' !important'};
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`
