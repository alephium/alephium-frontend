import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import { TableRow } from '@/components/Table'

interface NewTransactionsButtonRowProps {
  onClick: () => void
}

const NewTransactionsButtonRow = ({ onClick }: NewTransactionsButtonRowProps) => {
  const { t } = useTranslation()

  return (
    <NewTransactionsButtonRowStyled role="row" onClick={onClick}>
      <Button role="primary" short>
        {t('Click to display new transactions')}
      </Button>
    </NewTransactionsButtonRowStyled>
  )
}

export default NewTransactionsButtonRow

const NewTransactionsButtonRowStyled = styled(TableRow)`
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`
