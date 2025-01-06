import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import ConnectWithLedgerButton from '@/features/ledger/ConnectWithLedgerButton'

interface NewWalletActionsProps {
  onExistingWalletLinkClick?: () => void
}

const NewWalletActions = ({ onExistingWalletLinkClick }: NewWalletActionsProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <Paragraph centered secondary>
        {t('Please choose whether you want to create a new wallet or import an existing one.')}
      </Paragraph>
      <Section inList>
        <Button onClick={() => navigate('/create/0')}>{t('New wallet')}</Button>
        <Button onClick={() => navigate('/import/0')}>{t('Import wallet')}</Button>
        <ConnectWithLedgerButton />
        {onExistingWalletLinkClick && (
          <ActionLinkStyled onClick={onExistingWalletLinkClick}>{t('Use an existing wallet')}</ActionLinkStyled>
        )}
      </Section>
    </>
  )
}

export default NewWalletActions

const ActionLinkStyled = styled(ActionLink)`
  font-weight: var(--fontWeight-medium);
  font-size: 12px;
  font-family: inherit;
  height: var(--inputHeight);
`
