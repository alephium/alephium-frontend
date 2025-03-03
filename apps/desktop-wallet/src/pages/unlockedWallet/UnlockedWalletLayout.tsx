import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion } from 'framer-motion'
import { Bookmark, Clock, Home } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import WalletNameButton from '@/components/WalletNameButton'
import { useAppSelector } from '@/hooks/redux'
import { appHeaderHeightPx } from '@/style/globalStyles'

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
          <SideNavigation>
            <WalletNameButton />
            <NavItem Icon={Home} label={t('Overview')} to="/wallet/overview" />
            <NavItem Icon={Clock} label={t('Activity')} to="/wallet/activity" />
            <NavItem Icon={Bookmark} label={t('Addresses')} to="/wallet/addresses" />
          </SideNavigation>
        )}
      ></SideBar>

      <ScrollableContent>
        <Scrollbar>
          <AppHeader title={title} />
          <MainContent>{children}</MainContent>
        </Scrollbar>
      </ScrollableContent>
    </motion.div>
  )
}

export const UnlockedWalletPanel = styled.div<{
  top?: boolean
  bottom?: boolean
  doubleTop?: boolean
  backgroundColor?: keyof DefaultTheme['bg']
}>`
  padding-left: 30px;
  padding-right: 30px;

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

const ScrollableContent = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  overflow: hidden;
`

const MainContent = styled.div`
  padding-top: ${appHeaderHeightPx}px;
`

const SideNavigation = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`
