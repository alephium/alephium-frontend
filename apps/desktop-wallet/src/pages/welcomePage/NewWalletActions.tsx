import { AnalyticsEvent } from '@alephium/shared'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/Button'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'

interface NewWalletActionsProps {
  onExistingWalletLinkClick?: () => void
}

const NewWalletActions = ({ onExistingWalletLinkClick }: NewWalletActionsProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()

  const handleStartOnboarding = (method: 'create' | 'import') => {
    navigate(method === 'create' ? '/create/0' : '/import/0')

    sendAnalytics({ event: AnalyticsEvent.ONBOARDING_STARTED, props: { method } })
  }

  return (
    <>
      <Paragraph centered>
        {t('Please choose whether you want to create a new wallet or import an existing one.')}
      </Paragraph>
      <Section inList>
        <Button onClick={() => handleStartOnboarding('create')} tall>
          {t('New wallet')}
        </Button>
        <Button onClick={() => handleStartOnboarding('import')} tall>
          {t('Import wallet')}
        </Button>
        {onExistingWalletLinkClick && (
          <Button onClick={onExistingWalletLinkClick} Icon={ArrowLeft} role="secondary" justifyContent="center">
            {t('Use an existing wallet')}
          </Button>
        )}
      </Section>
    </>
  )
}

export default NewWalletActions
