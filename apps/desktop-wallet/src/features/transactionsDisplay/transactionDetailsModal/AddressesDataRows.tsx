import { useTransactionInfoType } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DataList from '@/components/DataList'
import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import { TransactionDisplayProps } from '@/features/transactionsDisplay/transactionDisplayTypes'

const AddressesDataRows = ({ tx, referenceAddress }: TransactionDisplayProps) => {
  const { t } = useTranslation()
  const infoType = useTransactionInfoType({ tx, referenceAddress, view: 'wallet' })

  if (infoType === 'bidirectional-transfer' || infoType === 'dApp' || infoType === 'dApp-failed') {
    return (
      <DataList.Row label={t('Addresses')}>
        <AddressesInvolved>
          <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" />
          <And>{t('and')}</And>
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

const And = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`
