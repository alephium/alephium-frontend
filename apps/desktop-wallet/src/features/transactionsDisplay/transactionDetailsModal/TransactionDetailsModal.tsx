import { AddressHash, findTransactionReferenceAddress, isConfirmedTx } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchTransaction from '@/api/apiDataHooks/transaction/useFetchTransaction'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import DataList from '@/components/DataList'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Tooltip from '@/components/Tooltip'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import FTAmounts from '@/features/transactionsDisplay/transactionDetailsModal/FTAmounts'
import GasUTXOsExpandableSection from '@/features/transactionsDisplay/transactionDetailsModal/GasUTXOsExpandableSection'
import LockTimeDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/LockTimeDataListRow'
import NFTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NFTsDataListRow'
import NSTsDataListRow from '@/features/transactionsDisplay/transactionDetailsModal/NSTsDataListRow'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import SideModal, { SideModalTitle } from '@/modals/SideModal'
import { formatDateForDisplay, openInWebBrowser } from '@/utils/misc'

export interface TransactionDetailsModalProps {
  txHash: e.Transaction['hash']
  refAddressHash?: AddressHash
}

const TransactionDetailsModal = memo(({ id, txHash, refAddressHash }: ModalBaseProp & TransactionDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('Transaction details')} header={<TransactionDetailsModalHeader txHash={txHash} />}>
      <Summary txHash={txHash} refAddressHash={refAddressHash} />
      <Details txHash={txHash} refAddressHash={refAddressHash} />
      <Tooltip />
    </SideModal>
  )
})

export default TransactionDetailsModal

const TransactionDetailsModalHeader = ({ txHash }: Pick<TransactionDetailsModalProps, 'txHash'>) => {
  const { t } = useTranslation()
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const handleExplorerLinkClick = () => openInWebBrowser(`${explorerUrl}/transactions/${txHash}`)

  return (
    <HeaderStyled>
      <SideModalTitle>{t('Transaction details')}</SideModalTitle>
      <ExplorerButton role="secondary" transparent short onClick={handleExplorerLinkClick}>
        {t('Show in explorer')} ↗
      </ExplorerButton>
    </HeaderStyled>
  )
}

// TODO: DRY AddressDetailsModalHeader.tsx
const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

// TODO: DRY AddressDetailsModalHeader.tsx
const ExplorerButton = styled(Button)`
  width: auto;
`

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
      </SummaryContent>
    </SummaryStyled>
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
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.tertiary};
  margin: var(--spacing-2);
  border-radius: var(--radius-big);
`

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--radius-big);
`

const DetailsStyled = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`
