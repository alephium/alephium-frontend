import { useTransactionInfoType } from '@alephium/shared-react'

import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const SecondAddressColumnCell = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view })

  if (view === 'address' && (infoType === 'address-group-transfer' || infoType === 'address-self-transfer')) {
    return null
  }

  return (
    <AddressCell shrink={view === 'address'}>
      {view === 'address' && (infoType === 'incoming' || infoType === 'airdrop') ? (
        <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view={view} hideLink truncate />
      ) : (
        <TransactionDestinationAddressesList
          tx={tx}
          referenceAddress={referenceAddress}
          view={view}
          hideLink
          truncate
        />
      )}
    </AddressCell>
  )
}

export default SecondAddressColumnCell
