import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button'
import { ReactComponent as LedgerLogo } from '@/images/ledger.svg'

const ConnectWithLedgerButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLedgerConnectClick = () => {
    navigate('/ledger')
  }

  return (
    <Button onClick={handleLedgerConnectClick} role="secondary" transparent short>
      <LedgerLogoStyled style={{ width: '15px', marginRight: '10px' }} />
      {t('Connect with Ledger')}
    </Button>
  )
}

export default ConnectWithLedgerButton

const LedgerLogoStyled = styled(LedgerLogo)`
  path {
    fill: ${({ theme }) => theme.font.primary};
  }
`
