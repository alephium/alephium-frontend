import { AddressHash, TransactionInfoType } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useMemo } from 'react'

import { getTransactionInfoType } from '@/features/transactionsDisplay/transactionDisplayUtils'

const useTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash,
  isInAddressDetailsModal?: boolean
): TransactionInfoType =>
  useMemo(
    () => getTransactionInfoType(tx, addressHash, isInAddressDetailsModal),
    [addressHash, isInAddressDetailsModal, tx]
  )

export default useTransactionInfoType
