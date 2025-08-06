import { getTransactionInfoType2, TransactionInfoType2, UseTransactionProps } from '@alephium/shared'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'

export const useTransactionInfoType2 = ({ tx, referenceAddress, view }: UseTransactionProps): TransactionInfoType2 => {
  const allAddressHashes = useUnsortedAddressesHashes()

  return useMemo(
    () =>
      getTransactionInfoType2({ tx, referenceAddress, internalAddresses: view === 'wallet' ? allAddressHashes : [] }),
    [allAddressHashes, referenceAddress, tx, view]
  )
}
