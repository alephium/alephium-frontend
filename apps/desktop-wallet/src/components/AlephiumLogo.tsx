import styled from 'styled-components'

import { ReactComponent as AlephiumLogoSVG } from '@/images/alephium_logo_monochrome.svg'

const AlephiumLogo = ({ contrasted }: { contrasted?: boolean }) => (
  <AlephiumLogoStyled contrasted={contrasted}>
    <AlephiumLogoSVG />
  </AlephiumLogoStyled>
)

export default AlephiumLogo

const AlephiumLogoStyled = styled.div<{ contrasted?: boolean }>`
  display: flex;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${({ theme, contrasted }) => (contrasted ? theme.font.contrastPrimary : theme.font.primary)} !important;
    }
  }
`
