import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import { Album, ArrowLeftRight, Layers } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getInitials, onEnterOrSpace } from '@/utils/misc'

interface UnlockedWalletLayoutProps {
  title?: string
  className?: string
  children?: ReactNode
}

dayjs.extend(relativeTime)

const walletNameAppearAfterSeconds = 1
const walletNameHideAfterSeconds = 4

const UnlockedWalletLayout = ({ children, title, className }: UnlockedWalletLayoutProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  const [fullWalletNameVisible, setFullWalletNameVisible] = useState(true)

  const openCurrentWalletModal = () => dispatch(openModal({ name: 'CurrentWalletModal' }))

  useEffect(() => {
    if (!fullWalletNameVisible) return

    const timeoutId = setTimeout(
      () => setFullWalletNameVisible(false),
      (walletNameHideAfterSeconds - walletNameAppearAfterSeconds) * 1000
    )

    return () => clearTimeout(timeoutId)
  }, [fullWalletNameVisible])

  if (!activeWalletName) return null

  const activeWalletNameInitials = getInitials(activeWalletName)

  return (
    <motion.div {...fadeInSlowly} className={className}>
      <SideBar>
        <AnimatePresence>
          {fullWalletNameVisible && (
            <OnEnterWalletName
              initial={{ x: 100, opacity: 0, scaleX: 1 }}
              animate={{ x: 130, opacity: 1, scaleX: 1 }}
              exit={{ x: -50, opacity: 0, scaleX: 0.5 }}
              transition={{
                type: 'spring',
                stiffness: 700,
                damping: 70,
                delay: walletNameAppearAfterSeconds
              }}
            >
              👋 {t('Wallet')}: {activeWalletName}
            </OnEnterWalletName>
          )}
        </AnimatePresence>
        <CurrentWalletInitials
          onClick={openCurrentWalletModal}
          onKeyDown={(e) => onEnterOrSpace(e, openCurrentWalletModal)}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: walletNameHideAfterSeconds, type: 'spring', stiffness: 500, damping: 70 }}
          key={`initials-${activeWalletName}`}
          role="button"
          tabIndex={0}
        >
          <AnimatePresence mode="wait">
            <WalletInitialsContainer
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 500, damping: 70 }}
            >
              {activeWalletNameInitials}
            </WalletInitialsContainer>
          </AnimatePresence>
        </CurrentWalletInitials>
        <SideNavigation>
          <NavItem Icon={Layers} label={t('Overview')} to="/wallet/overview" />
          <NavItem Icon={ArrowLeftRight} label={t('Transfers')} to="/wallet/transfers" />
          <NavItem Icon={Album} label={t('Addresses')} to="/wallet/addresses" />
        </SideNavigation>
      </SideBar>

      <Scrollbar>
        <MainContent>{children}</MainContent>
        <AppHeader title={title} />
      </Scrollbar>
    </motion.div>
  )
}

export const UnlockedWalletPanel = styled.div<{
  top?: boolean
  bottom?: boolean
  doubleTop?: boolean
  backgroundColor?: keyof Pick<DefaultTheme['bg'], 'background1' | 'background2'>
}>`
  padding-left: 60px;
  padding-right: 60px;

  ${({ top, doubleTop }) => css`
    padding-top: ${top ? 20 : doubleTop ? 40 : 0}px;
  `}

  ${({ bottom }) =>
    bottom &&
    css`
      padding-bottom: 60px;
    `}

  ${({ backgroundColor }) =>
    backgroundColor &&
    css`
      background-color: ${({ theme }) => theme.bg[backgroundColor]};
    `}
`

export default styled(UnlockedWalletLayout)`
  display: flex;
  width: 100%;
  height: 100%;
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.bg.background1};
  position: relative;
`

const SideNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const CurrentWalletInitials = styled(motion.div)`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: ${({ theme }) => theme.shadow.primary};
  overflow: hidden;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const OnEnterWalletName = styled(CurrentWalletInitials)`
  position: absolute;
  left: 20px;
  width: auto;
  border-radius: var(--radius-big);
  white-space: nowrap;
  padding: 20px;
  font-size: 15px;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 2px solid ${({ theme }) => theme.global.accent};
`

const WalletInitialsContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`
