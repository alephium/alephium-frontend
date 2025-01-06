import { AddressHash, findTransactionReferenceAddress, isConfirmedTx } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchTransaction from '@/api/apiDataHooks/transaction/useFetchTransaction'
import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import DataList from '@/components/DataList'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Tooltip from '@/components/Tooltip'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import DirectionalInfo from '@/features/transactionsDisplay/transactionDetailsModal/DirectionalInfo'
import FTAmounts from '@/features/transactionsDisplay/transactionDetailsModal/FTAmounts'
import FTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/FTsDataListRow'
import GasUTXOsExpandableSection from '@/features/transactionsDisplay/transactionDetailsModal/GasUTXOsExpandableSection'
import LockTimeDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/LockTimeDataListRow'
import NFTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NFTsDataListRow'
import NSTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NSTsDataListRow'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import useOpenTxInExplorer from '@/features/transactionsDisplay/transactionDetailsModal/useOpenTxInExplorer'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import SideModal from '@/modals/SideModal'
import { formatDateForDisplay } from '@/utils/misc'

export interface TransactionDetailsModalProps {
  txHash: e.Transaction['hash']
  refAddressHash?: AddressHash
}

const TransactionDetailsModal = memo(({ id, txHash, refAddressHash }: ModalBaseProp & TransactionDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('Transaction details')}>
      <Summary txHash={txHash} refAddressHash={refAddressHash} />
      <Details txHash={txHash} refAddressHash={refAddressHash} />
      <Tooltip />
    </SideModal>
  )
})

export default TransactionDetailsModal

const Summary = ({ txHash, refAddressHash }: TransactionDetailsModalProps) => {
  const { data: tx } = useFetchTransaction({ txHash })
  const allAddressHashes = useUnsortedAddressesHashes()

  if (!tx) return null

  const referenceAddress = refAddressHash ?? findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddress) return null

  return (
    <SummaryStyled>
      <SummaryContent>
        <TransactionType tx={tx} refAddressHash={referenceAddress} />
        <FTAmounts tx={tx} refAddressHash={referenceAddress} />
        <DirectionalInfo tx={tx} refAddressHash={referenceAddress} />

        <ShowInExplorerButton txHash={txHash} />
      </SummaryContent>
    </SummaryStyled>
  )
}

const ShowInExplorerButton = ({ txHash }: Pick<TransactionDetailsModalProps, 'txHash'>) => {
  const { t } = useTranslation()

  const handleShowTxInExplorer = useOpenTxInExplorer(txHash)

  return (
    <ActionLink onClick={handleShowTxInExplorer} withBackground>
      {t('Show in explorer')} ↗
    </ActionLink>
  )
}

const Details = ({ txHash, refAddressHash }: TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data: tx, isLoading } = useFetchTransaction({ txHash })

  if (isLoading)
    return (
      <DetailsStyled>
        <SkeletonLoader height="400px" />
      </DetailsStyled>
    )

  if (!tx) return null

  const referenceAddress = refAddressHash ?? findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddress) return null

  return (
    <DetailsStyled role="table">
      {tx && (
        <>
          <DataList>
            <AddressesDataRows tx={tx} refAddressHash={referenceAddress} />

            <DataList.Row label={t('Status')}>
              {!isConfirmedTx(tx) ? (
                <Badge color={theme.font.secondary}>
                  <span tabIndex={0}>
                    {t('Pending')} <Spinner size="10px" />
                  </span>
                </Badge>
              ) : tx.scriptExecutionOk ? (
                <Badge color={theme.global.valid}>
                  <span tabIndex={0}>{t('Confirmed')}</span>
                </Badge>
              ) : (
                <Badge color={theme.global.alert}>
                  <span tabIndex={0}>{t('Script execution failed')}</span>
                </Badge>
              )}
            </DataList.Row>

            {isConfirmedTx(tx) && (
              <DataList.Row label={t('Timestamp')}>
                <span tabIndex={0}>{formatDateForDisplay(tx.timestamp)}</span>
              </DataList.Row>
            )}

            <LockTimeDataListRow tx={tx} />

            <DataList.Row label={t('Fee')}>
              <Amount tokenId={ALPH.id} tabIndex={0} value={BigInt(tx.gasAmount) * BigInt(tx.gasPrice)} fullPrecision />
            </DataList.Row>

            <FTsDataListRow tx={tx} refAddressHash={referenceAddress} />
            <NFTsDataListRow tx={tx} refAddressHash={referenceAddress} />
            <NSTsDataListRow tx={tx} refAddressHash={referenceAddress} />
          </DataList>

          <GasUTXOsExpandableSection tx={tx} />
        </>
      )}
    </DetailsStyled>
  )
}

const SummaryStyled = styled.div`
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
`

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
`

const DetailsStyled = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`
