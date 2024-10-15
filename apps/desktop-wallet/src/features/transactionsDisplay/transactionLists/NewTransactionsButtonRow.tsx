/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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