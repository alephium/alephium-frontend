/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import Button from '@/components/Button'
import useThrottledGitHubApi, { storeAppMetadata } from '@/hooks/useThrottledGitHubApi'
import { appHeaderHeightPx, messagesLeftMarginPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { Announcement } from '@/types/announcement'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

import announcementFile from '../../announcement.json'

interface AnnouncementBannerProps {
  className?: string
}

// Meant only for dev. Never commit it with value `true`
const useLocalAnnouncementFileForDevelopment = false

const AnnouncementBanner = ({ className }: AnnouncementBannerProps) => {
  const [announcement, setAnnouncement] = useState<Announcement | undefined>(
    useLocalAnnouncementFileForDevelopment ? announcementFile : undefined
  )

  useThrottledGitHubApi(async ({ lastAnnouncementHashChecked }) => {
    const response = await fetch(links.announcement)
    const { content: contentBase64, sha: contentHash } = await response.json()

    if (contentHash === lastAnnouncementHashChecked) return

    try {
      const announcementContent = JSON.parse(atob(contentBase64)) as Announcement

      setAnnouncement(announcementContent)
      storeAppMetadata({ lastAnnouncementHashChecked: contentHash })
    } catch (e) {
      console.error('Could not parse announcement content')
    }
  })

  const handleAnnouncementButtonClick = () => {
    if (announcement && announcement.button) openInWebBrowser(announcement.button.link)
  }

  return (
    <AnimatePresence mode="wait">
      {announcement && announcement.isActive && (
        <AnnouncementBannerStyled className={className} onClick={() => setAnnouncement(undefined)} {...fadeInOut}>
          <Contents>
            <Icon>
              <Megaphone size={24} />
            </Icon>
            <Texts>
              <Title>{announcement.title}</Title>
              <Description>{announcement.description}</Description>
            </Texts>
            {announcement.button ? (
              <ButtonStyled short onClick={handleAnnouncementButtonClick}>
                {announcement.button.title}
              </ButtonStyled>
            ) : (
              <ButtonStyled short role="secondary" Icon={X} squared />
            )}
          </Contents>
        </AnnouncementBannerStyled>
      )}
    </AnimatePresence>
  )
}

export default AnnouncementBanner

const AnnouncementBannerStyled = styled(motion.div)`
  position: fixed;
  top: ${appHeaderHeightPx}px;
  left: ${walletSidebarWidthPx + messagesLeftMarginPx}px;
  border: 1px solid ${({ theme }) => theme.global.accent};
  border-radius: 52px;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 8px 11px;
  z-index: 1;
  max-width: 50%;
`

const Contents = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
`

const Texts = styled.div`
  margin-right: var(--spacing-4);
`

const Title = styled.div`
  font-size: 12px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.primary};
`

const Description = styled.div`
  font-size: 12px;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.tertiary};
  margin-top: 3px;
`

const ButtonStyled = styled(Button)`
  margin: 0;
  height: 35px;
  border-radius: 35px;
  flex-shrink: 0;
`

const Icon = styled.div`
  width: 43px;
  height: 43px;
  background-color: ${({ theme }) => theme.global.highlight};
  border-radius: var(--radius-full);
  padding: var(--spacing-2);
  color: ${({ theme }) => theme.font.contrastSecondary};
  align-items: center;
  justify-content: center;
  display: flex;
`
