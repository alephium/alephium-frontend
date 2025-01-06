import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/Button'

const ConnectWithLedgerButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLedgerConnectClick = () => {
    navigate('/ledger')
  }

  return <Button onClick={handleLedgerConnectClick}>{t('Connect with Ledger')}</Button>
}

export default ConnectWithLedgerButton
