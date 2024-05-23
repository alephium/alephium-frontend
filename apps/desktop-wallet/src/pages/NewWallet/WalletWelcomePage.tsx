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

import { Info } from 'lucide-react'
import { useState } from 'react'
import Confetti from 'react-confetti'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import ExpandableSection from '@/components/ExpandableSection'
import InfoBox from '@/components/InfoBox'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { FooterActionsContainer, Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { saveAddressSettings } from '@/storage/addresses/addressesStorageUtils'
import { useTimeout, useWindowSize } from '@/utils/hooks'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

// This is shown when a user creates or imports a wallet

const WalletWelcomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { width, height } = useWindowSize()
  const { generateAndSaveOneAddressPerGroup } = useAddressGeneration()
  const { sendAnalytics } = useAnalytics()

  const [shouldGenerateOneAddressPerGroup, setShouldGenerateOneAddressPerGroup] = useState(false)
  const [confettiRunning, setConfettiRunning] = useState(true)

  useTimeout(() => {
    setConfettiRunning(false)
  }, 3000)

  const onButtonClick = () => {
    if (shouldGenerateOneAddressPerGroup && defaultAddress) {
      generateAndSaveOneAddressPerGroup({
        labelPrefix: 'Address',
        labelColor: defaultAddress.color,
        skipGroups: [defaultAddress.group]
      })

      try {
        saveAddressSettings(defaultAddress, {
          isDefault: true,
          color: defaultAddress.color,
          label: `Address ${defaultAddress.group}`
        })

        sendAnalytics({ event: 'Generated one address per group on wallet creation' })
      } catch {
        sendAnalytics({ type: 'error', message: 'Failed to generate one address per group' })
      }
    }

    navigate('/wallet/overview')
  }

  return (
    <Container>
      <ConfettiWrapper>
        <Confetti width={width} height={height} numberOfPieces={confettiRunning ? 200 : 0} />
      </ConfettiWrapper>
      <Section>
        <ReadyParagraph>{t('Everything is ready!')}</ReadyParagraph>
        <SubParagraph>{t('Welcome to Alephium.')}</SubParagraph>
      </Section>
      <FooterActionsContainer>
        <Button onClick={onButtonClick} submit>
          {t("Let's go!")}
        </Button>
        <div>
          <AdvancedUserMessage>
            <span>
              <Trans t={t} i18nKey="welcomeScreenPassphraseMessage">
                If you want to use a
                <ActionLink onClick={() => openInWebBrowser(links.passphrase)}>passphrase</ActionLink>, lock your newly
                created wallet.
              </Trans>
            </span>
          </AdvancedUserMessage>
        </div>
        <div>
          <AdvancedUserMessage>
            <span>
              <Trans t={t} i18nKey="welcomeScreenOneAddressPerGroupMessage">
                Advanced user: want to start with <b>one address per group for mining or DeFi?</b>
              </Trans>
            </span>
            <InfoIcon size="16px" onClick={() => openInWebBrowser(links.miningWallet)} />
          </AdvancedUserMessage>
          <ExpandableSectionStyled
            sectionTitleClosed={t('Show advanced options')}
            sectionTitleOpen={t('Hide advanced options')}
            centered
          >
            <InfoBox contrast noBorders>
              <KeyValueInputStyled
                label={t('Generate one address per group')}
                description={t('For mining or DeFi use.')}
                InputComponent={
                  <Toggle
                    toggled={shouldGenerateOneAddressPerGroup}
                    onToggle={() => setShouldGenerateOneAddressPerGroup(!shouldGenerateOneAddressPerGroup)}
                  />
                }
              />
            </InfoBox>
          </ExpandableSectionStyled>
        </div>
      </FooterActionsContainer>
    </Container>
  )
}

export default WalletWelcomePage

const Container = styled.main`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const ConfettiWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  pointer-events: none;
`

const ReadyParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 3rem;
  font-weight: var(--fontWeight-bold);
`

const SubParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.font.secondary};
`

const AdvancedUserMessage = styled.div`
  margin-top: 90px;
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);

  b {
    font-weight: var(--fontWeight-medium);
    color: ${({ theme }) => theme.font.primary};
  }
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: var(--spacing-5);
  width: 100%;
`

const KeyValueInputStyled = styled(KeyValueInput)`
  min-width: auto;
`

const InfoIcon = styled(Info)`
  cursor: pointer;
  color: ${({ theme }) => theme.font.primary};
`
