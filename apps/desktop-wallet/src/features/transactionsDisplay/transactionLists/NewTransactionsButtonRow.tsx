import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TableCell, TableRow } from '@/components/Table'

interface NewTransactionsButtonRowProps {
  onClick: () => void
}

const NewTransactionsButtonRow = ({ onClick }: NewTransactionsButtonRowProps) => {
  const { t } = useTranslation()

  return (
    <NewTransactionsButtonRowStyled role="row" onClick={onClick}>
      <TableCell align="center" role="gridcell">
        🆕 {t('Click to display new transactions')}
      </TableCell>
    </NewTransactionsButtonRowStyled>
  )
}

export default NewTransactionsButtonRow

const NewTransactionsButtonRowStyled = styled(TableRow)`
  background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.15).toHex()};
`
