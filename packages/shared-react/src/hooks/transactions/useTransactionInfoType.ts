import { AddressHash, getTransactionInfoType, isInternalTx, TransactionInfoType } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

export const useTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const isInternalTransfer = isInternalTx(tx, allAddressHashes)

  return useMemo(
    () => getTransactionInfoType(tx, addressHash, isInternalTransfer, isInAddressDetailsModal),
    [addressHash, isInAddressDetailsModal, isInternalTransfer, tx]
  )
}
