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

import styled from 'styled-components'

import ExternalLink from '@/components/ExternalLink'
import LanguageSwitch from '@/components/LanguageSwitch'
import NetworkSwitch from '@/components/NetworkSwitch'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { ReactComponent as DiscordIcon } from '@/images/brand-icon-discord.svg'
import { ReactComponent as RedditIcon } from '@/images/brand-icon-reddit.svg'
import { ReactComponent as TelegramIcon } from '@/images/brand-icon-telegram.svg'
import { ReactComponent as TwitterIcon } from '@/images/brand-icon-twitter.svg'
import { deviceBreakPoints } from '@/styles/globalStyles'

import { version } from '../../package.json'

interface AppFooterProps {
  className?: string
}

const AppFooter = ({ className }: AppFooterProps) => (
  <footer className={className}>
    <LeftGroup>
      <StyledNetworkSwitch direction="up" />
      <LanguageSwitch />
      <ThemeSwitcher />
    </LeftGroup>
    <RightGroup>
      <Version>v{version}</Version>
      <span>
        <ExternalLink href="https://github.com/alephium/explorer">Source code ↗</ExternalLink>
      </span>
      <ExternalLink href="https://alephium.org">Alephium.org ↗</ExternalLink>
      <SocialMediaIconList>
        {socialMediaData.map((d) => (
          <ExternalLink href={d.link} key={d.name}>
            <d.Icon data-tooltip-id="default" data-tooltip-content={d.name} className="social-media-icon" />
          </ExternalLink>
        ))}
      </SocialMediaIconList>
    </RightGroup>
  </footer>
)

const socialMediaData = [
  {
    name: 'Discord',
    link: 'https://discord.gg/JErgRBfRSB',
    Icon: DiscordIcon
  },
  {
    name: 'Telegram',
    link: 'https://t.me/alephiumgroup',
    Icon: TelegramIcon
  },
  {
    name: 'Reddit',
    link: 'https://www.reddit.com/r/Alephium',
    Icon: RedditIcon
  },
  {
    name: 'Twitter',
    link: 'https://twitter.com/alephium',
    Icon: TwitterIcon
  }
]

export default styled(AppFooter)`
  display: flex;
  justify-content: space-between;
  backdrop-filter: blur(20px);
  padding: 15px 30px;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    gap: 30px;
  }
`

const FooterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
  }
`

const LeftGroup = styled(FooterGroup)`
  justify-self: flex-start;
`

const RightGroup = styled(FooterGroup)`
  justify-self: flex-end;

  .social-media-icon {
    fill: ${({ theme }) => theme.font.secondary};
    height: 25px;
    width: 25px;

    &:hover {
      cursor: pointer;
      fill: ${({ theme }) => theme.font.primary};
    }
  }
`

const SocialMediaIconList = styled.div`
  display: flex;
  gap: 20px;
  margin-right: 20px;
`

const StyledNetworkSwitch = styled(NetworkSwitch)`
  display: none;

  @media ${deviceBreakPoints.mobile} {
    display: inherit;
  }
`

const Version = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`
