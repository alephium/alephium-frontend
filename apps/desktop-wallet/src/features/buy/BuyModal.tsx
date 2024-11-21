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
import { memo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CenteredModal from '@/modals/CenteredModal'
import { electron, openInWebBrowser } from '@/utils/misc'

export interface BuyModalProps {
  addressHash: AddressHash
}

const BuyModal = memo(({ id, addressHash }: ModalBaseProp & BuyModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)

  const banxaURL =
    'https://alephium.banxa.com/' +
    `?walletAddress=${addressHash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`

  const handleAcceptDisclaimer = () => {
    setIsDisclaimerAccepted(true)
    electron?.app.openOnRampServiceWindow({ url: banxaURL, targetLocation: 'https://alephium.org' })
  }

  return (
    <CenteredModal id={id} title={t('Buy')} fullScreen dynamicContent noPadding>
      <Content>
        <IFrameStyled title={t('Buy')} src={banxaURL} />
        {!isDisclaimerAccepted && (
          <DisclaimerOverlay>
            <h1 style={{ margin: 0 }}>{t('Disclaimer')}</h1>
            <span>
              <Trans t={t} i18nKey="banxaDisclaimer">
                You are about to access 3rd party services provided by
                <ActionLinkStyled onClick={() => openInWebBrowser('https://www.banxa.com')}></ActionLinkStyled> through
                an in-app browser. Alephium does not control Banxa’s services. Banxa’s terms and conditions will apply,
                so please read and understand them before proceeding.
              </Trans>
            </span>
            <Button onClick={handleAcceptDisclaimer} role="primary" tall>
              {t('Continue')}
            </Button>
          </DisclaimerOverlay>
        )}
      </Content>
    </CenteredModal>
  )
})

export default BuyModal

const IFrameStyled = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const DisclaimerOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.bg.background2};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: auto;
  padding: 10% 30%;
`

const ActionLinkStyled = styled(ActionLink)`
  display: inline;
`
