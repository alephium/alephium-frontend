import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/Button'
import { ReactComponent as LedgerLogo } from '@/images/ledger.svg'

const ConnectWithLedgerButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLedgerConnectClick = () => {
    navigate('/ledger')
  }

  return (
    <Button onClick={handleLedgerConnectClick} role="secondary" variant="faded" short style={{ width: '80%' }}>
      <LedgerLogo style={{ width: '15px', marginRight: '10px' }} />
      {t('Connect with Ledger')}
    </Button>
  )
}

export default ConnectWithLedgerButton
