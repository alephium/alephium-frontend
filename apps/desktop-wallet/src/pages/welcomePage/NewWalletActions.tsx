import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/Button'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'

interface NewWalletActionsProps {
  onExistingWalletLinkClick?: () => void
}

const NewWalletActions = ({ onExistingWalletLinkClick }: NewWalletActionsProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <Paragraph centered>
        {t('Please choose whether you want to create a new wallet or import an existing one.')}
      </Paragraph>
      <Section inList>
        <Button onClick={() => navigate('/create/0')} tall>
          {t('New wallet')}
        </Button>
        <Button onClick={() => navigate('/import/0')} tall>
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
