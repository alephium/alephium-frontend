import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ScreenSection } from '~/components/layout/Screen'

interface SignTxModalFooterButtonsSectionProps {
  onReject: () => void
  onApprove: () => void
}

const SignTxModalFooterButtonsSection = ({ onReject, onApprove }: SignTxModalFooterButtonsSectionProps) => {
  const { t } = useTranslation()

  return (
    <ScreenSection centered>
      <ButtonsRow>
        <Button title={t('Reject')} variant="alert" onPress={onReject} flex />
        <Button title={t('Approve')} variant="valid" onPress={onApprove} flex />
      </ButtonsRow>
    </ScreenSection>
  )
}

export default SignTxModalFooterButtonsSection
