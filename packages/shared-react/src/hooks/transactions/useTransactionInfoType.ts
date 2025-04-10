import {
  AddressHash,
  getTransactionInfoType,
  isInternalTx,
  isSentTx,
  SentTransaction,
  TransactionInfoType
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

export const useTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const isInternalTransfer = isSentTx(tx) ? false : isInternalTx(tx, allAddressHashes)

  return useMemo(
    () => getTransactionInfoType(tx, addressHash, isInternalTransfer, isInAddressDetailsModal),
    [addressHash, isInAddressDetailsModal, isInternalTransfer, tx]
  )
}
