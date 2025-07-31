import { AddressHash, getTransactionInfoType2, SentTransaction, TransactionInfoType2 } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'

export const useTransactionInfoType2 = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  referenceAddress: AddressHash,
  view: 'address' | 'wallet'
): TransactionInfoType2 => {
  const allAddressHashes = useUnsortedAddressesHashes()

  return useMemo(
    () =>
      getTransactionInfoType2({ tx, referenceAddress, internalAddresses: view === 'wallet' ? allAddressHashes : [] }),
    [allAddressHashes, referenceAddress, tx, view]
  )
}
