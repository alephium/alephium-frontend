import { ReactNode } from 'react'
import styled from 'styled-components'

import SideBarSettingsButton from '@/components/PageComponents/SideBarSettingsButton'
import { appHeaderHeightPx, sidebarExpandThresholdPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { platform } from '@/utils/platform'

interface SideBarProps {
  children?: ReactNode
  className?: string
}

const SideBar = ({ children, className }: SideBarProps) => (
  <SideBarStyled className={className}>
    <TopContainer>{children}</TopContainer>
    <BottomButtonsContainer>
      <BottomButtons>
        <SideBarSettingsButton />
      </BottomButtons>
    </BottomButtonsContainer>
  </SideBarStyled>
)

export default SideBar

const SideBarStyled = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: ${walletSidebarWidthPx}px;
  padding: ${platform.isMac ? appHeaderHeightPx + 'px' : 'var(--spacing-2)'} var(--spacing-2) var(--spacing-2)
    var(--spacing-2);
  border-right: 1px solid ${({ theme }) => theme.border.secondary};

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    width: ${walletSidebarWidthPx * 3}px;
    align-items: normal;
  }
`

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  app-region: no-drag;
`

const BottomButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-start;

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    justify-content: space-around;
    width: 100%;
  }
`

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  app-region: no-drag;

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    flex: 1;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`
