import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import useAnalytics from '@/features/analytics/useAnalytics'
import { ReactComponent as LockBodySVG } from '@/images/lock_body.svg'
import { ReactComponent as LockHandleSVG } from '@/images/lock_handle.svg'

const CheckWordsIntroPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { sendAnalytics } = useAnalytics()

  const handleNextPress = () => {
    sendAnalytics({ event: 'Creating wallet: Ready to verify words: Clicked next' })
    onButtonNext()
  }

  const handleBackPress = () => {
    sendAnalytics({ event: 'Creating wallet: Ready to verify words: Clicked back' })
    onButtonBack()
  }

  return (
    <FloatingPanel enforceMinHeight>
      <PanelContentContainer>
        <Section>
          <LockContainer>
            <Lock
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -5, 0], y: [0, 10, -5, 0] }}
              transition={{ delay: 1.1, duration: 0.3 }}
            >
              <LockHandleContainer initial={{ y: 10 }} animate={{ y: 50 }} transition={{ delay: 1 }}>
                <LockHandle />
              </LockHandleContainer>
              <LockBodyContainer>
                <LockBody />
              </LockBodyContainer>
            </Lock>
          </LockContainer>
          <Paragraph centered>
            {t('Alright! Time to check if you got your words right!')} {t('Select the words in the right order.')}{' '}
            {t('Ready?')}
          </Paragraph>
        </Section>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button onClick={handleBackPress} tall role="secondary">
          {t('Back')}
        </Button>
        <Button onClick={handleNextPress} tall>
          {t('Ready!')}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default CheckWordsIntroPage

const LockContainer = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-5);
  border-radius: var(--radius-small);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 30px;
`

const Lock = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 35vw;
`

const LockHandleContainer = styled(motion.div)`
  width: 70%;
  flex: 1;
`

const LockBodyContainer = styled(motion.div)`
  width: 100%;
  flex: 1;
  isolation: isolate;
`

const LockHandle = styled(LockHandleSVG)`
  width: 100%;
`

const LockBody = styled(LockBodySVG)`
  width: 100%;
`
