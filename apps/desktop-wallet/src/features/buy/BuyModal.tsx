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

import { AddressHash } from '@alephium/shared'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import FooterButton from '@/components/Buttons/FooterButton'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CenteredModal from '@/modals/CenteredModal'
import { electron, openInWebBrowser } from '@/utils/misc'

export interface BuyModalProps {
  addressHash: AddressHash
}

const BuyModal = memo(({ id, addressHash }: ModalBaseProp & BuyModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const banxaURL =
    'https://alephium.banxa.com/' +
    `?walletAddress=${addressHash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`

  const handleAcceptDisclaimer = () => {
    electron?.app.openOnRampServiceWindow({ url: banxaURL, targetLocation: 'https://alephium.org' })
  }

  return (
    <CenteredModal id={id} title={t('Disclaimer')}>
      <DisclaimerText>
        <Trans t={t} i18nKey="banxaDisclaimer">
          You are about to access 3rd party services provided by
          <ActionLinkStyled onClick={() => openInWebBrowser('https://www.banxa.com')}></ActionLinkStyled> through an
          in-app browser. Alephium does not control Banxa’s services. Banxa’s terms and conditions will apply, so please
          read and understand them before proceeding.
        </Trans>
      </DisclaimerText>
      <FooterButton onClick={handleAcceptDisclaimer} role="primary" tall>
        {t('Continue')}
      </FooterButton>
    </CenteredModal>
  )
})

export default BuyModal

const ActionLinkStyled = styled(ActionLink)`
  display: inline;
`

const DisclaimerText = styled.span`
  font-size: 14px;
`
