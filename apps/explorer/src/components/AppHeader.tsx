import { Link, useLocation } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import SearchBar from '@/components/SearchBar'
import { useWindowSize } from '@/hooks/useWindowSize'
import logoDarkSrc from '@/images/explorer-logo-dark.svg'
import logoLightSrc from '@/images/explorer-logo-light.svg'
import { deviceBreakPoints, deviceSizes } from '@/styles/globalStyles'

interface AppHeaderProps {
  className?: string
}

const AppHeader = ({ className }: AppHeaderProps) => {
  const theme = useTheme()
  const { pathname } = useLocation()
  const { width } = useWindowSize()

  return (
    <header className={className}>
      <HeaderSideContainer justifyContent="flex-start">
        <StyledLogoLink to="/">
          <Logo alt="alephium" src={theme.name === 'light' ? logoLightSrc : logoDarkSrc} />
        </StyledLogoLink>
      </HeaderSideContainer>
      {(pathname !== '/' || (width && width <= deviceSizes.mobile)) && <StyledSearchBar />}
      <HeaderSideContainer justifyContent="flex-end" hideOnMobile></HeaderSideContainer>
    </header>
  )
}

export default styled(AppHeader)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px min(5vw, 50px);
  gap: 5vw;
`

const HeaderSideContainer = styled.div<{ justifyContent: 'flex-start' | 'flex-end'; hideOnMobile?: boolean }>`
  flex: 1;
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent};

  @media ${deviceBreakPoints.mobile} {
    flex: 0;

    ${({ hideOnMobile }) =>
      hideOnMobile &&
      css`
        display: none;
      `};
  }
`

const StyledSearchBar = styled(SearchBar)`
  flex: 3;
  max-width: 1100px;
`

const StyledLogoLink = styled(Link)`
  @media ${deviceBreakPoints.mobile} {
    width: 30px;
    overflow: hidden;
  }
`

const Logo = styled.img`
  width: 130px;

  @media ${deviceBreakPoints.mobile} {
    width: 100px;
  }
`
