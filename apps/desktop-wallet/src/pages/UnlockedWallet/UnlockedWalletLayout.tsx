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

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { motion } from 'framer-motion'
import { Album, ArrowLeftRight, Layers } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import NavItem from '@/components/NavItem'
import SideBar from '@/components/PageComponents/SideBar'
import ScrollbarCustom from '@/components/Scrollbar'
import { useAppSelector } from '@/hooks/redux'

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
            <NavItem Icon={Layers} label={t('Overview')} to="/wallet/overview" />
            <NavItem Icon={ArrowLeftRight} label={t('Transfers')} to="/wallet/transfers" />
            <NavItem Icon={Album} label={t('Addresses')} to="/wallet/addresses" />
          </SideNavigation>
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
    padding-top: ${top ? 20 : doubleTop ? 40 : 0}px;
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
  gap: 15px;
`
