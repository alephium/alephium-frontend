import { useTransactionInfoType2 } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DataList from '@/components/DataList'
import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const AddressesDataRows = ({ tx, referenceAddress }: TransactionDetailsModalTxProps) => {
  const { t } = useTranslation()
  const infoType = useTransactionInfoType2({ tx, referenceAddress, view: 'wallet' })

  if (infoType === 'bidirectional-transfer' || infoType === 'dApp') {
    return (
      <DataList.Row label={t('Addresses')}>
        <AddressesInvolved>
          <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
          <FromIn>{t('and')}</FromIn>
          <TransactionDestinationAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
        </AddressesInvolved>
      </DataList.Row>
    )
  }

  return (
    <>
      <DataList.Row label={t('From')}>
        <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
      </DataList.Row>
      <DataList.Row label={t('To')}>
        <TransactionDestinationAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
      </DataList.Row>
    </>
  )
}

export default AddressesDataRows

const AddressesInvolved = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 100%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`
