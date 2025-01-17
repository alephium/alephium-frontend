import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion } from 'framer-motion'
import { Bookmark, Clock, Home } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AlephiumLogo from '@/components/AlephiumLogo'
import AppHeader from '@/components/AppHeader'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import ScrollbarCustom from '@/components/Scrollbar'
import { useAppSelector } from '@/hooks/redux'
import { sidebarExpandThresholdPx } from '@/style/globalStyles'

interface UnlockedWalletLayoutProps {
  title?: string
  className?: string
  children?: ReactNode
}

dayjs.extend(relativeTime)

const UnlockedWalletLayout = ({ children, title, className }: UnlockedWalletLayoutProps) => {
  const { t } = useTranslation()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  if (!activeWalletName) return null

  return (
    <motion.div {...fadeInSlowly} className={className}>
      <SideBar
        renderTopComponent={() => (
          <>
            <BrandContainer>
              <AlephiumLogoContainer>
                <AlephiumLogo />
              </AlephiumLogoContainer>
              <AlephiumName>alephium</AlephiumName>
            </BrandContainer>
            <SideNavigation>
              <NavItem Icon={Home} label={t('Overview')} to="/wallet/overview" />
              <NavItem Icon={Clock} label={t('Activity')} to="/wallet/activity" />
              <NavItem Icon={Bookmark} label={t('Addresses')} to="/wallet/addresses" />
            </SideNavigation>
          </>
        )}
      ></SideBar>

      <ScrollbarCustom>
        <MainContent>
          <AppHeader title={title} />
          {children}
        </MainContent>
      </ScrollbarCustom>
    </motion.div>
  )
}

export const UnlockedWalletPanel = styled.div<{
  top?: boolean
  bottom?: boolean
  doubleTop?: boolean
  backgroundColor?: keyof DefaultTheme['bg']
}>`
  padding-left: 40px;
  padding-right: 40px;

  ${({ top, doubleTop }) => css`
    padding-top: ${top ? 10 : doubleTop ? 20 : 0}px;
  `}

  ${({ bottom }) =>
    bottom &&
    css`
      padding-bottom: 40px;
    `}

  ${({ backgroundColor }) =>
    backgroundColor &&
    css`
      background-color: ${({ theme }) => theme.bg[backgroundColor]};
    `}
`

export default styled(UnlockedWalletLayout)`
  display: flex;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const BrandContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: var(--spacing-6);
  margin-left: var(--spacing-3);
`

const AlephiumLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
`

const AlephiumName = styled.div`
  font-size: 18px;
  font-weight: var(--fontWeight-semiBold);
  display: none;

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    display: block;
  }
`
