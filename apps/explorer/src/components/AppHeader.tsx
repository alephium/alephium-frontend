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

import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import NetworkSwitch from '@/components/NetworkSwitch'
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
      <HeaderSideContainer justifyContent="flex-end" hideOnMobile>
        <NetworkSwitch direction="down" />
      </HeaderSideContainer>
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
