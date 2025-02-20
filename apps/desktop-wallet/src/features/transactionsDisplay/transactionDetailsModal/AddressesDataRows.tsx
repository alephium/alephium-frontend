import { isConfirmedTx } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import IOList from '@/components/IOList'
import { selectPendingSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import DirectionalInfo from '@/features/transactionsDisplay/transactionDetailsModal/DirectionalInfo'
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'
import useOpenTxInExplorer from '@/features/transactionsDisplay/transactionDetailsModal/useOpenTxInExplorer'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'
import { useAppSelector } from '@/hooks/redux'

const AddressesDataRows = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, refAddressHash)
  const onAddressClick = useOnAddressClick()
  const handleShowTxInExplorer = useOpenTxInExplorer(tx.hash)
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  if (direction === 'swap')
    return (
      <DataList.Row label={t('Addresses')}>
        <DirectionalInfo tx={tx} refAddressHash={refAddressHash} />
      </DataList.Row>
    )

  const handleAddressClick = () => onAddressClick(refAddressHash)

  return (
    <>
      <DataList.Row label={t('Transaction hash')}>
        <TransactionHash onClick={handleShowTxInExplorer}>
          <HashEllipsed hash={tx.hash} tooltipText={t('Copy hash')} />
        </TransactionHash>
      </DataList.Row>
      <DataList.Row label={t('From')}>
        {direction === 'out' ? (
          <ActionLinkStyled onClick={handleAddressClick}>
            <AddressBadge addressHash={refAddressHash} truncate withBorders />
          </ActionLinkStyled>
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={false}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
            linkToExplorer
          />
        )}
      </DataList.Row>
      <DataList.Row label={t('To')}>
        {pendingSentTx ? (
          <PendingSentAddressBadge tx={tx} refAddressHash={refAddressHash} isDestinationAddress />
        ) : direction !== 'out' ? (
          <ActionLinkStyled onClick={handleAddressClick} key={refAddressHash}>
            <AddressBadge addressHash={refAddressHash} truncate withBorders />
          </ActionLinkStyled>
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
            linkToExplorer
          />
        )}
      </DataList.Row>
    </>
  )
}

export default AddressesDataRows

const TransactionHash = styled(ActionLink)`
  max-width: 125px;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: flex-end;
`
