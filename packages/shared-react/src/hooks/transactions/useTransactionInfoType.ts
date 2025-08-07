import { getTransactionInfoType, TransactionInfoType2, UseTransactionProps } from '@alephium/shared'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'

export const useTransactionInfoType = ({ tx, referenceAddress, view }: UseTransactionProps): TransactionInfoType2 => {
  const allAddressHashes = useUnsortedAddressesHashes()

  return useMemo(
    () =>
      getTransactionInfoType({ tx, referenceAddress, internalAddresses: view === 'wallet' ? allAddressHashes : [] }),
    [allAddressHashes, referenceAddress, tx, view]
  )
}
