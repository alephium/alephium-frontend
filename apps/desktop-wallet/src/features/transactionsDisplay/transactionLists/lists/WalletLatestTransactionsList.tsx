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

import { explorer as e } from '@alephium/web3'
import { uniqBy } from 'lodash'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import useFetchWalletTransactionsLimited from '@/api/apiDataHooks/wallet/useFetchWalletTransactionsLimited'
import ActionLink from '@/components/ActionLink'
import Table, { TableHeader } from '@/components/Table'
import { openModal } from '@/features/modals/modalActions'
import TableRowsLoader from '@/features/transactionsDisplay/transactionLists/TableRowsLoader'
import TransactionsListFooter from '@/features/transactionsDisplay/transactionLists/TransactionsListFooter'
import TransactionRow from '@/features/transactionsDisplay/transactionRow/TransactionRow'
import { useAppDispatch } from '@/hooks/redux'
import { onEnterOrSpace } from '@/utils/misc'

const WalletLatestTransactionsList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: confirmedTxs, isLoading } = useFetchWalletTransactionsLimited()

  const openTransactionDetailsModal = (txHash: e.Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash } }))

  return (
    <Table minWidth="500px">
      <TableHeader title={t('Latest transactions')}>
        <ActionLinkStyled onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight}>
          {t('See more')}
        </ActionLinkStyled>
      </TableHeader>

      {isLoading && <TableRowsLoader />}

      {/* TODO: Remove uniqBy once backend removes duplicates from its results */}
      {uniqBy(confirmedTxs, 'hash').map((tx) => (
        <TransactionRow
          key={tx.hash}
          tx={tx}
          onClick={() => openTransactionDetailsModal(tx.hash)}
          onKeyDown={(e) => onEnterOrSpace(e, () => openTransactionDetailsModal(tx.hash))}
        />
      ))}

      {!isLoading && (
        <TransactionsListFooter
          isDisplayingTxs={(confirmedTxs?.length ?? 0) > 0}
          showLoadMoreBtn={false}
          showSpinner={false}
          noTxsMsg={t("This wallet doesn't have any transactions yet.")}
        />
      )}
    </Table>
  )
}

export default WalletLatestTransactionsList

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`
