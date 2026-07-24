import { Link, useLocation } from 'react-router-dom'
import styled, { css, keyframes, useTheme } from 'styled-components'

import SearchBar from '@/components/SearchBar'
import { useWindowSize } from '@/hooks/useWindowSize'
import CalzoneIcon from '@/images/calzone.svg?react'
import logoDarkSrc from '@/images/explorer-logo-dark.svg'
import logoLightSrc from '@/images/explorer-logo-light.svg'
import { deviceBreakPoints, deviceSizes } from '@/styles/globalStyles'
import { CALZONE_TX_HASH, isCalzoneDay } from '@/utils/calzone'

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
        {isCalzoneDay() && (
          <CalzoneLink
            to={`/transactions/${CALZONE_TX_HASH}`}
            aria-label="calzone"
            data-tooltip-id="default"
            data-tooltip-content="Happy Calzone Day! 🍕"
          >
            <CalzoneIcon />
          </CalzoneLink>
        )}
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

const wobble = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-14deg); }
  75% { transform: rotate(14deg); }
`

const CalzoneLink = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: 12px;
  width: 28px;
  height: 28px;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:hover {
    animation: ${wobble} 0.6s ease-in-out;
  }
`

const Logo = styled.img`
  width: 110px;

  @media ${deviceBreakPoints.mobile} {
    width: 100px;
  }
`
