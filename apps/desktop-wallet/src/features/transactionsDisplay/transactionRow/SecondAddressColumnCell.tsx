import { useTransactionInfoType2 } from '@alephium/shared-react'

import { TransactionDestinationAddressesList } from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const SecondAddressColumnCell = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const infoType = useTransactionInfoType2({ tx, referenceAddress: referenceAddress, view })

  if (view === 'address' && (infoType === 'address-group-transfer' || infoType === 'address-self-transfer')) {
    return null
  }

  return (
    <AddressCell shrink={view === 'address'}>
      <TransactionDestinationAddressesList
        tx={tx}
        referenceAddress={referenceAddress}
        view="wallet"
        hideLink
        truncate
      />
    </AddressCell>
  )
}

export default SecondAddressColumnCell
