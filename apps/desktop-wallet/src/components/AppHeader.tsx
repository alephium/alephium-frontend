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

import { colord } from 'colord'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import DefaultAddressSwitch from '@/components/DefaultAddressSwitch'
import CompactToggle from '@/components/Inputs/CompactToggle'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import { useScrollContext } from '@/contexts/scroll'
import { openModal } from '@/features/modals/modalActions'
import RefreshButton from '@/features/refreshData/RefreshButton'
import { discreetModeToggled } from '@/features/settings/settingsActions'
import SettingsButton from '@/features/settings/SettingsButton'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import { ReactComponent as WalletConnectLogo } from '@/images/wallet-connect-logo.svg'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { appHeaderHeightPx } from '@/style/globalStyles'

interface AppHeader {
  title?: string
  invisible?: boolean
  position?: 'fixed' | 'sticky'
  className?: string
}

const AppHeader: FC<AppHeader> = ({ children, title, className, invisible, position = 'sticky' }) => {
  const { t } = useTranslation()
  const { scrollY: scrollYContext } = useScrollContext()
  const initialScroll = useMotionValue(0)
  const scrollY = scrollYContext || initialScroll
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { isWalletUnlocked } = useWalletLock()
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const networkStatus = useAppSelector((s) => s.network.status)
  const { activeSessions } = useWalletConnectContext()

  const offlineText = t('The wallet is offline.')

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const gradientOpacity = useTransform(scrollY, [0, 100], [0, 1])

  const titleStyles = {
    opacity: useTransform(scrollY, [0, 100, 100], [0, 0, 1]),
    transition: 'opacity 0.2s ease-out'
  }

  if (invisible) return <motion.header id="app-drag-region" className={className} />

  const openWalletConnectModal = () => dispatch(openModal({ name: 'WalletConnectModal' }))

  return (
    <AppHeaderStyled style={{ position }}>
      <GradientBackground style={{ opacity: gradientOpacity }} />
      <AppHeaderContainer id="app-drag-region" className={className}>
        <Title style={titleStyles}>{title}</Title>
        <HeaderButtons>
          {networkStatus === 'offline' && (
            <>
              <OfflineIcon
                tabIndex={0}
                aria-label={offlineText}
                data-tooltip-content={offlineText}
                data-tooltip-id="default"
              >
                <WifiOff size={16} color={theme.global.alert} />
              </OfflineIcon>
              <VerticalDivider />
            </>
          )}
          {children && (
            <>
              {children}
              <VerticalDivider />
            </>
          )}
          {isWalletUnlocked && (
            <>
              <RefreshButton />

              <VerticalDivider />
            </>
          )}
          <CompactToggle
            toggled={discreetMode}
            onToggle={toggleDiscreetMode}
            IconOn={EyeOff}
            IconOff={Eye}
            data-tooltip-id="default"
            data-tooltip-content={t('Discreet mode')}
            short
          />
          <VerticalDivider />
          {isWalletUnlocked && (
            <>
              <Button
                transparent
                circle
                short
                role="secondary"
                onClick={openWalletConnectModal}
                aria-label="WalletConnect"
                isHighlighted={activeSessions.length > 0}
                data-tooltip-id="default"
                data-tooltip-content={t('Connect wallet to dApp')}
                Icon={WalletConnectLogoStyled}
              />
              <VerticalDivider />
            </>
          )}
          {defaultAddress && !isPassphraseUsed && (
            <>
              <DefaultAddressSwitch />
              <VerticalDivider />
            </>
          )}
          <SettingsButton />
        </HeaderButtons>
      </AppHeaderContainer>
    </AppHeaderStyled>
  )
}

export default AppHeader

const AppHeaderStyled = styled(motion.header)`
  position: sticky;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
`

const AppHeaderContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: ${appHeaderHeightPx}px;
  padding: 0 var(--spacing-2) 0 40px;
  gap: var(--spacing-1);
`

const GradientBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: ${({ theme }) => `linear-gradient(to bottom, ${colord(theme.bg.background1).toHex()} 35%, transparent)`};
  pointer-events: none;
  z-index: 0;
`

const OfflineIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.2).toHex()};
`

const Title = styled(motion.div)`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const HeaderButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-1);
  app-region: no-drag;

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }
`

const WalletConnectLogoStyled = styled(WalletConnectLogo)`
  height: auto;
  width: 100%;

  path {
    fill: ${({ theme }) => theme.font.secondary};
  }
`
