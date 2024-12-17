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

import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import WalletNameButton from '@/components/WalletNameButton'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface SideBarProps {
  renderTopComponent?: () => ReactNode
  noExpansion?: boolean
  noBorder?: boolean
  className?: string
}

export const SIDEBAR_EXPAND_THRESHOLD_PX = 1200

const SideBar = ({ renderTopComponent, noExpansion = false, noBorder = false, className }: SideBarProps) => (
  <SideBarStyled id="app-drag-region" className={className} noExpansion={noExpansion} noBorder={noBorder}>
    <TopContainer>{renderTopComponent?.()}</TopContainer>
    <BottomButtonsContainer>
      <BottomButtons>
        <WalletNameButton />
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
  padding: ${appHeaderHeightPx - 20}px var(--spacing-3) var(--spacing-3) var(--spacing-3);
  border-right: ${({ theme, noBorder }) => (!noBorder ? `1px solid ${theme.border.secondary}` : 'none')};

  ${({ noExpansion }) =>
    !noExpansion
      ? css`
          @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
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
        `}
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

  @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
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

  @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
    flex: 1;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`
