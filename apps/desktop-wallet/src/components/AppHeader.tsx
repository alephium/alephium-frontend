import { colord } from 'colord'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import DefaultAddressSwitch from '@/components/DefaultAddressSwitch'
import CompactToggle from '@/components/Inputs/CompactToggle'
import NetworkSwitch from '@/components/NetworkSwitch'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import TitleBar from '@/components/TitleBar.tsx'
import { useScrollContext } from '@/contexts/scroll'
import { openModal } from '@/features/modals/modalActions'
import RefreshButton from '@/features/refreshData/RefreshButton'
import { discreetModeToggled } from '@/features/settings/settingsActions'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import { ReactComponent as WalletConnectLogo } from '@/images/wallet-connect-logo.svg'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { platform } from '@/utils/platform.ts'

interface AppHeader {
  title?: string
  invisible?: boolean
  className?: string
}

const AppHeader: FC<AppHeader> = ({ children, title, className, invisible }) => {
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

  const headerStyles = {
    backgroundColor: useTransform(
      scrollY,
      [0, 100],
      [colord(theme.bg.background1).alpha(0).toHex(), colord(theme.bg.tertiary).alpha(0.9).toHex()]
    )
  }

  const titleStyles = {
    opacity: useTransform(scrollY, [0, 100, 100], [0, 0, 1]),
    transition: 'opacity 0.2s ease-out'
  }

  if (invisible) return <InvisibleAppHeader id="app-header" className={className} />

  const openWalletConnectModal = () => dispatch(openModal({ name: 'WalletConnectModal' }))

  return (
    <AppHeaderStyled id="app-header" style={headerStyles} className={className} invisible={invisible}>
      {!platform.isMac && <TitleBar />}
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
              <WifiOff size={20} color={theme.global.alert} />
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
              squared
              short
              role="secondary"
              onClick={openWalletConnectModal}
              aria-label="WalletConnect"
              isHighlighted={activeSessions.length > 0}
              data-tooltip-id="default"
              data-tooltip-content={t('Connect wallet to dApp')}
            >
              <WalletConnectLogoStyled />
            </Button>
            <VerticalDivider />
          </>
        )}

        {defaultAddress && !isPassphraseUsed && (
          <>
            <DefaultAddressSwitch />
            <VerticalDivider />
          </>
        )}

        <NetworkSwitch />
      </HeaderButtons>
    </AppHeaderStyled>
  )
}

export default AppHeader

const AppHeaderStyled = styled(motion.header)<Pick<AppHeader, 'invisible'>>`
  position: fixed;
  top: 0;
  right: 0;
  left: ${walletSidebarWidthPx}px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  height: ${appHeaderHeightPx}px;
  padding: 0 var(--spacing-4) 0 60px;
  gap: var(--spacing-1);

  backdrop-filter: ${({ invisible }) => (!invisible ? 'blur(10px)' : 'none')};
  z-index: 1;
  -webkit-app-region: drag;
`

const InvisibleAppHeader = styled(motion.header)`
  -webkit-app-region: drag;
`

const OfflineIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 35px;
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
  -webkit-app-region: no-drag;

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }
`

const WalletConnectLogoStyled = styled(WalletConnectLogo)`
  height: auto;
`
