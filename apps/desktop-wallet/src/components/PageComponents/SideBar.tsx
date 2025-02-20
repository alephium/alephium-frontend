import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import SideBarSettingsButton from '@/components/PageComponents/SideBarSettingsButton'
import { appHeaderHeightPx, sidebarExpandThresholdPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface SideBarProps {
  renderTopComponent?: () => ReactNode
  noExpansion?: boolean
  noBorder?: boolean
  className?: string
}

const SideBar = ({ renderTopComponent, noExpansion = false, noBorder = false, className }: SideBarProps) => (
  <SideBarStyled id="app-drag-region" className={className} noExpansion={noExpansion} noBorder={noBorder}>
    <TopContainer>{renderTopComponent?.()}</TopContainer>
    <BottomButtonsContainer>
      <BottomButtons>
        <SideBarSettingsButton />
      </BottomButtons>
    </BottomButtonsContainer>
  </SideBarStyled>
)

export default SideBar

const SideBarStyled = styled.div<{ noBorder: boolean; noExpansion: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx}px var(--spacing-2) var(--spacing-2) var(--spacing-2);
  background-color: ${({ theme }) => theme.bg.background2};
  border-right: 1px solid ${({ theme }) => theme.border.secondary};

  ${({ noExpansion }) =>
    !noExpansion
      ? css`
          @media (min-width: ${sidebarExpandThresholdPx}px) {
            width: ${walletSidebarWidthPx * 3}px;
            align-items: normal;
          }
        `
      : css`
          position: absolute;
          left: 0;
          bottom: 0;
          top: 0;
          z-index: 3;
        `};
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
