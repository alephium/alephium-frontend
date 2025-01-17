import { explorer as e } from '@alephium/web3'
import { ChevronRight } from 'lucide-react'
import { memo } from 'react'
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

const WalletLatestTransactionsList = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { data: confirmedTxs, isLoading } = useFetchWalletTransactionsLimited()

  const openTransactionDetailsModal = (txHash: e.Transaction['hash']) =>
    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash } }))

  return (
    <Table minWidth="500px">
      <TableHeader title={t('Latest transactions')}>
        <ActionLinkStyled onClick={() => navigate('/wallet/activity')} Icon={ChevronRight}>
          {t('See more')}
        </ActionLinkStyled>
      </TableHeader>

      {isLoading && <TableRowsLoader />}

      {confirmedTxs.map((tx) => (
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
})

export default WalletLatestTransactionsList

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`
