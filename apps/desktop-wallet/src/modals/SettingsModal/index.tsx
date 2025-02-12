import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Settings, X } from 'lucide-react'
import { memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { fadeInOutBottomFast } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { TabItemSimple } from '@/components/tabs/tabsTypes'
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

type SettingsTabItem = TabItemSimple<SettingsModalTabNames>

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
      <CenteredBox role="dialog" {...fadeInOutBottomFast}>
        <TabTitlesColumn>
          <TabTitlesColumnContent>
            <TabTitles>
              {enabledTabs.map((tab) => {
                const isActive = currentTab.value === tab.value
                return (
                  <TabTitleButton
                    key={tab.value}
                    role="secondary"
                    transparent={!isActive}
                    onClick={() => setCurrentTab(tab)}
                    style={{ opacity: !isActive ? 0.5 : 1 }}
                    justifyContent="flex-start"
                    wide
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
              <Settings color={theme.font.secondary} size={16} />
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
            <ColumnHeaderBackground />
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
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const TabTitlesColumn = styled(Column)`
  position: relative;
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background1};
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
  min-height: 50px;
  z-index: 1;
`

const ColumnHeaderBackground = styled.div`
  position: absolute;
  top: 0;
  bottom: -10px;
  right: 0;
  left: 0;
  background: ${({ theme }) => `linear-gradient(to bottom, ${colord(theme.bg.background1).toHex()} 55%, transparent)`};
  z-index: 0;
`

const ColumnTitle = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
  z-index: 1;
`

const ColumnContent = styled.div`
  padding: 20px;
  padding-top: 60px;

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
  padding: 60px 10px 10px 10px;
  height: 100%;
`

const TabTitles = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

const TabTitlesColumnHeader = styled(ColumnHeader)`
  padding-left: 20px;
  padding-right: 20px;
  background: transparent;
`

const TabTitleButton = styled(Button)`
  border-radius: var(--radius-medium);
  font-size: 13px;
  margin: 0;

  &:first-child {
    margin-top: 0;
  }
`
