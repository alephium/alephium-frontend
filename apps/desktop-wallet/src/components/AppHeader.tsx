import { selectDefaultAddress } from '@alephium/shared'
import { colord } from 'colord'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import DefaultAddressSwitch from '@/components/DefaultAddressSwitch'
import CompactToggle from '@/components/Inputs/CompactToggle'
import NetworkSwitch from '@/components/NetworkSwitch'
import VerticalDivider from '@/components/PageComponents/VerticalDivider'
import TitleBar from '@/components/TitleBar.tsx'
import { useScrollContext } from '@/contexts/scroll'
import { openModal } from '@/features/modals/modalActions'
import AppHeaderOfflineButton from '@/features/offline/AppHeaderOfflineButton'
import RefreshButton from '@/features/refreshData/RefreshButton'
import { discreetModeToggled } from '@/features/settings/settingsActions'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ReactComponent as WalletConnectLogo } from '@/images/wallet-connect-logo.svg'
import { selectIsWalletUnlocked } from '@/storage/wallets/walletSelectors'
import { appHeaderHeightPx } from '@/style/globalStyles'
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
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const isWalletUnlocked = useAppSelector(selectIsWalletUnlocked)
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const { activeSessions } = useWalletConnectContext()

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const gradientOpacity = useTransform(scrollY, [0, 100], [0, 1])

  const titleStyles = {
    opacity: useTransform(scrollY, [0, 100, 100], [0, 0, 1]),
    transition: 'opacity 0.2s ease-out'
  }

  if (invisible) return <InvisibleAppHeader className={className} />

  const openWalletConnectModal = () => dispatch(openModal({ name: 'WalletConnectModal' }))

  return (
    <AppHeaderStyled className={className}>
      <GradientBackground style={{ opacity: gradientOpacity }} />
      <AppHeaderContainer>
        {!platform.isMac && <TitleBar />}
        <Title style={titleStyles}>{title}</Title>
        <HeaderButtons>
          <NetworkSwitch />
          <VerticalDivider />
          <AppHeaderOfflineButton />
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
            onClick={toggleDiscreetMode}
            IconOn={EyeOff}
            IconOff={Eye}
            data-tooltip-id="default"
            data-tooltip-content={t('Discreet mode')}
            short
            squared
          />
          {isWalletUnlocked && (
            <>
              <VerticalDivider />
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
                squared
              />
              <VerticalDivider />
            </>
          )}
          {defaultAddress && !isPassphraseUsed && <DefaultAddressSwitch />}
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
  padding: 0 var(--spacing-1) 0 30px;
  gap: var(--spacing-1);
  -webkit-app-region: drag;
`

const GradientBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: ${({ theme }) => `linear-gradient(to bottom, ${colord(theme.bg.background1).toHex()} 35%, transparent)`};
  pointer-events: none;
`

const InvisibleAppHeader = styled(motion.header)`
  -webkit-app-region: drag;
`

const Title = styled(motion.div)`
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const HeaderButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-1);
  -webkit-app-region: no-drag;
  padding-right: ${!platform.isMac ? '165px' : 0};

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
