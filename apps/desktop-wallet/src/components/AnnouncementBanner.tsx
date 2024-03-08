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
import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import useThrottledGitHubApi, { storeAppMetadata } from '@/hooks/useThrottledGitHubApi'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { Announcement } from '@/types/announcement'
import { useTimeout } from '@/utils/hooks'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

import announcementFile from '../../announcement.json'
import { exponentialBackoffFetchRetry } from '@alephium/shared'

interface AnnouncementBannerProps {
  className?: string
}

const AnnouncementBanner = ({ className }: AnnouncementBannerProps) => {
  const { t } = useTranslation()
  const [announcement, setAnnouncement] = useState<Announcement | undefined>(
    import.meta.env.VITE_USE_LOCAL_ANNOUNCEMENT_FILE === 'true' ? (announcementFile as Announcement) : undefined
  )

  const [contentHash, setContentHash] = useState<string>()
  const [wasShownOnMount, setWasShownOnMount] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isCompact, setIsCompact] = useState(true)

  useTimeout(() => setIsCompact(false), 1500)
  useTimeout(() => {
    setIsCompact(true)
    setWasShownOnMount(true)
  }, 6000)

  useThrottledGitHubApi({
    lastGithubCallTimestampKey: 'lastTimeGitHubApiWasCalledForAnnouncenent',
    githubApiCallback: async ({ lastAnnouncementHashChecked }) => {
      const response = await exponentialBackoffFetchRetry(links.announcement)
      const { content: contentBase64, sha: contentSHA } = await response.json()

      setContentHash(contentSHA)

      if (contentSHA === lastAnnouncementHashChecked) return

      try {
        const announcementContent = JSON.parse(atob(contentBase64)) as Announcement

        setAnnouncement(announcementContent)
      } catch (e) {
        console.error('Could not parse announcement content')
      }
    }
  })

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (isHovered && isCompact) {
      setIsCompact(false)
    } else if (wasShownOnMount && !isHovered && !isCompact) {
      timeoutId = setTimeout(() => setIsCompact(true), 1500)
    } else if (timeoutId && isHovered) {
      clearTimeout(timeoutId)
      timeoutId = undefined
      setIsCompact(false)
    }

    return () => clearTimeout(timeoutId)
  }, [isCompact, isHovered, wasShownOnMount])

  const handleAnnouncementButtonClick = () => {
    if (announcement?.button?.link) openInWebBrowser(announcement.button.link)
  }

  const handleAnnouncementHide = () => {
    storeAppMetadata({ lastAnnouncementHashChecked: contentHash })
    setAnnouncement(undefined)
  }

  const handleMouseEnter = () => setIsHovered(true)

  const handleMouseLeave = () => setIsHovered(false)

  return (
    <AnimatePresence mode="wait">
      {announcement && announcement.isActive && announcement.title && (
        <AnnouncementBannerStyled
          className={className}
          initial={{ opacity: 0, height: 50, width: 50 }}
          animate={{ opacity: 1, height: isCompact ? 50 : 70, width: isCompact ? 50 : 650 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Contents>
            <Icon animate={{ height: isCompact ? 42 : 50, width: isCompact ? 42 : 50, x: isCompact ? -8 : 0 }}>
              <Megaphone size={24} />
            </Icon>

            <TextsAndButtons animate={{ opacity: isCompact ? 0 : 1 }}>
              <Texts>
                <Title>{announcement.title}</Title>
                {announcement.description && <Description>{announcement.description}</Description>}
              </Texts>
              <ActionButtons>
                <ButtonStyled short role="secondary" onClick={handleAnnouncementHide}>
                  {t('Hide')}
                </ButtonStyled>
                {announcement.button?.title && announcement.button.link && (
                  <ButtonStyled short onClick={handleAnnouncementButtonClick}>
                    {announcement.button.title}
                  </ButtonStyled>
                )}
              </ActionButtons>
            </TextsAndButtons>
          </Contents>
        </AnnouncementBannerStyled>
      )}
    </AnimatePresence>
  )
}

export default AnnouncementBanner

const AnnouncementBannerStyled = styled(motion.div)`
  display: flex;
  position: fixed;
  top: ${appHeaderHeightPx}px;
  right: 20px;
  border: 2px solid ${({ theme }) => theme.global.accent};
  border-radius: 52px;
  background-color: ${({ theme }) => colord(theme.bg.background2).alpha(0.5).toHex()};
  z-index: 1;
  backdrop-filter: blur(20px);
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
`

const Contents = styled.div`
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  width: 100%;
`

const Texts = styled.div`
  width: 100%;
  margin-right: var(--spacing-4);
`

const Title = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.primary};
`

const Description = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.tertiary};
  margin-top: 3px;
`

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-2);
`

const ButtonStyled = styled(Button)`
  margin: 0;
  height: 35px;
  border-radius: 35px;
  flex-shrink: 0;
`

const Icon = styled(motion.div)`
  width: 42px;
  height: 42px;
  background-color: ${({ theme }) => theme.global.highlight};
  border-radius: var(--radius-full);
  padding: var(--spacing-2);
  color: ${({ theme }) => theme.font.contrastSecondary};
  align-items: center;
  justify-content: center;
  display: flex;
  flex-shrink: 0;
`

const TextsAndButtons = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`
