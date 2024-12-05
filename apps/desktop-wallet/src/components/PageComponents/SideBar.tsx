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

import { Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import AlephiumLogo from '@/components/AlephiumLogo'
import Button from '@/components/Button'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import WalletNameButton from '@/components/WalletNameButton'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface SideBarProps {
  renderTopComponent?: () => ReactNode
  noExpansion?: boolean
  className?: string
}

export const SIDEBAR_EXPAND_THRESHOLD_PX = 1200

const SideBar = ({ renderTopComponent, noExpansion, className }: SideBarProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: {} }))

  return (
    <SideBarStyled id="app-drag-region" className={className} noExpansion={noExpansion}>
      <AlephiumLogoContainer>
        <AlephiumLogo />
      </AlephiumLogoContainer>
      <TopContainer>{renderTopComponent?.()}</TopContainer>
      <BottomButtonsContainer>
        <BottomButtons>
          <ThemeSwitcher />
          <Button
            transparent
            squared
            role="secondary"
            onClick={openSettingsModal}
            aria-label={t('Settings')}
            Icon={Settings}
            data-tooltip-id="sidenav"
            rounded
            data-tooltip-content={t('Settings')}
          />
          <WalletNameButton />
        </BottomButtons>
      </BottomButtonsContainer>
    </SideBarStyled>
  )
}

export default SideBar

const SideBarStyled = styled.div<{ noExpansion?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 1;
  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx - 20}px 0 var(--spacing-4) var(--spacing-4);
  transition: width 0.4s ease-in-out;

  ${({ noExpansion }) =>
    !noExpansion
      ? css`
          @media (min-width: ${SIDEBAR_EXPAND_THRESHOLD_PX}px) {
            width: ${walletSidebarWidthPx * 3}px;
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

const AlephiumLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 13px;
  width: 40px;
  height: 40px;
  margin: 0 1px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.contrast};
  margin-bottom: var(--spacing-7);
  app-region: no-drag;
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
`

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  app-region: no-drag;
`
