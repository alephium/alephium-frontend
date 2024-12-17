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
import { motion } from 'framer-motion'
import { Settings, X } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { TabItem } from '@/components/TabBar'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import discordLogo from '@/images/brand-icon-discord.svg'
import githubLogo from '@/images/brand-icon-github.svg'
import twitterLogo from '@/images/brand-icon-twitter.svg'
import ModalContainer from '@/modals/ModalContainer'
import DevToolsSettingsSection from '@/modals/SettingsModal/DevToolsSettingsSection'
import GeneralSettingsSection from '@/modals/SettingsModal/GeneralSettingsSection'
import NetworkSettingsSection from '@/modals/SettingsModal/NetworkSettingsSection'
import WalletsSettingsSection from '@/modals/SettingsModal/WalletsSettingsSection'
import { currentVersion } from '@/utils/app-data'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

type SettingsModalTabNames = 'general' | 'wallets' | 'network' | 'devtools'

type SettingsTabItem = TabItem<SettingsModalTabNames>

interface SocialMediaLogo {
  media: keyof Pick<typeof links, 'twitter' | 'discord' | 'github'>
  img: string
}

const socialMediaLogos: SocialMediaLogo[] = [
  { media: 'twitter', img: twitterLogo },
  { media: 'discord', img: discordLogo },
  { media: 'github', img: githubLogo }
]

export interface SettingsModalProps {
  initialTabValue?: SettingsModalTabNames
}

const SettingsModal = memo(({ id, initialTabValue }: ModalBaseProp & SettingsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { isWalletUnlocked } = useWalletLock()
  const dispatch = useAppDispatch()

  const settingsModalTabs: SettingsTabItem[] = useMemo(
    () => [
      { value: 'general', label: t('General') },
      { value: 'wallets', label: t('Wallets') },
      { value: 'network', label: t('Network') },
      { value: 'devtools', label: t('Developer tools') }
    ],
    [t]
  )
  const activeTab = settingsModalTabs.find((t) => t.value === initialTabValue) || settingsModalTabs[0]

  const [currentTab, setCurrentTab] = useState<SettingsTabItem>(activeTab)

  const enabledTabs = !isWalletUnlocked
    ? settingsModalTabs.filter(({ value }) => value !== 'devtools')
    : settingsModalTabs

  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  const onClose = () => dispatch(closeModal({ id }))

  return (
    <ModalContainer id={id}>
      <CenteredBox role="dialog" {...fadeInOutScaleFast}>
        <TabTitlesColumn>
          <TabTitlesColumnContent>
            <TabTitles>
              {enabledTabs.map((tab) => {
                const isActive = currentTab.value === tab.value
                return (
                  <TabTitleButton
                    key={tab.value}
                    role={isActive ? 'primary' : 'secondary'}
                    variant="faded"
                    wide
                    transparent={!isActive}
                    onClick={() => setCurrentTab(tab)}
                  >
                    {tab.label}
                  </TabTitleButton>
                )
              })}
            </TabTitles>
            <SidebarFooter>
              <SocialMedias>
                {socialMediaLogos.map(({ media, img }) => (
                  <SocialMedia key={media} $src={img} onClick={() => openInWebBrowser(links[media])} />
                ))}
              </SocialMedias>
              <Version>v{currentVersion}</Version>
            </SidebarFooter>
          </TabTitlesColumnContent>
          <TabTitlesColumnHeader>
            <ColumnTitle>
              <Settings color={theme.font.secondary} strokeWidth={1} />
              {t('Settings')}
            </ColumnTitle>
          </TabTitlesColumnHeader>
        </TabTitlesColumn>
        <TabContentsColumn>
          <Scrollbar>
            <ColumnContent>
              {
                {
                  general: <GeneralSettingsSection />,
                  wallets: <WalletsSettingsSection />,
                  network: <NetworkSettingsSection />,
                  devtools: <DevToolsSettingsSection />
                }[currentTab.value]
              }
            </ColumnContent>
          </Scrollbar>
          <ColumnHeader>
            <ColumnTitle>{currentTab.label}</ColumnTitle>
            <Button aria-label={t('Close')} circle role="secondary" onClick={onClose} Icon={X} tiny />
          </ColumnHeader>
        </TabContentsColumn>
      </CenteredBox>
    </ModalContainer>
  )
})

export default SettingsModal

const CenteredBox = styled(motion.div)`
  display: flex;

  position: relative;
  overflow: hidden;

  width: 85vw;
  max-width: 748px;
  height: 85vh;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.background1};
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const TabTitlesColumn = styled(Column)`
  position: relative;
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background2};
`
const TabContentsColumn = styled(Column)`
  position: relative;
  flex: 2;
`

const ColumnHeader = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  padding: 0 10px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  background: ${({ theme }) => `linear-gradient(to bottom, ${colord(theme.bg.background2).toHex()} 55%, transparent)`};
  z-index: 1;
`

const ColumnTitle = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const ColumnContent = styled.div`
  padding: 20px;
  padding-top: 70px;

  h2 {
    width: 100%;
    padding-bottom: 10px;
    margin-bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-8);
`

const Version = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.tertiary};
`

const SocialMedias = styled.div`
  display: flex;
  gap: 10px;
`

const SocialMedia = styled.div<{ $src: string }>`
  ${({ $src }) => css`
    -webkit-mask: url(${$src}) no-repeat center;
    mask: url(${$src}) no-repeat center;
  `}

  height: 20px;
  width: 20px;
  background-color: ${({ theme }) => theme.font.tertiary};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.font.primary};
  }
`

const TabTitlesColumnContent = styled(ColumnContent)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 70px 15px 10px 15px;
  height: 100%;
`

const TabTitles = styled.div``

const TabTitlesColumnHeader = styled(ColumnHeader)`
  padding-left: 22px;
  padding-right: 22px;
`

const TabTitleButton = styled(Button)`
  height: 46px;
  text-align: left;
  border-radius: var(--radius-big);

  &:first-child {
    margin-top: 0;
  }
`
