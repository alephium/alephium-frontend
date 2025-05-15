import { AddressHash, getTransactionInfoType, SentTransaction, TransactionInfoType } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'

export const useTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const allAddressHashes = useUnsortedAddressesHashes()

  return useMemo(
    () => getTransactionInfoType(tx, addressHash, allAddressHashes, isInAddressDetailsModal),
    [addressHash, isInAddressDetailsModal, allAddressHashes, tx]
  )
}
