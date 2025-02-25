import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const WalletSecretPhraseExportButton = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openSecretPhraseModal = () => dispatch(openModal({ name: 'SecretPhraseModal' }))

  return (
    <Button role="secondary" variant="alert" onClick={openSecretPhraseModal}>
      {t('Show your secret recovery phrase')}
    </Button>
  )
}

export default WalletSecretPhraseExportButton
