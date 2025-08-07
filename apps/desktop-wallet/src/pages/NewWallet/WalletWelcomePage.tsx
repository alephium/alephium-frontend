import { useState } from 'react'
import Confetti from 'react-confetti'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import ExpandableSection from '@/components/ExpandableSection'
import { FooterActionsContainer, Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import { useTimeout, useWindowSize } from '@/utils/hooks'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

// This is shown when a user creates or imports a wallet

const WalletWelcomePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { width, height } = useWindowSize()

  const [confettiRunning, setConfettiRunning] = useState(true)

  useTimeout(() => setConfettiRunning(false), 3000)

  const onButtonClick = async () => navigate('/wallet/overview')

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
        <Button onClick={onButtonClick} submit tall>
          {t("Let's go!")}
        </Button>
        <div>
          <ExpandableSectionStyled
            sectionTitleClosed={t('Show advanced options')}
            sectionTitleOpen={t('Hide advanced options')}
            centered
          >
            <AdvancedExpandableSectionContent>
              <AdvancedUserMessage>
                <Trans t={t} i18nKey="welcomeScreenPassphraseMessage">
                  If you want to use a
                  <ActionLink onClick={() => openInWebBrowser(links.passphrase)}>passphrase</ActionLink>, lock your
                  newly created wallet.
                </Trans>
              </AdvancedUserMessage>
            </AdvancedExpandableSectionContent>
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
  z-index: 1;
`

const ConfettiWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
`

const ReadyParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 3rem;
  font-weight: var(--fontWeight-semiBold);
`

const SubParagraph = styled(Paragraph)`
  text-align: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.font.secondary};
`

const AdvancedUserMessage = styled.div`
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

const AdvancedExpandableSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
`
