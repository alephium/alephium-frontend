import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

export interface TransactionDetailsModalTxProps {
  tx: e.Transaction | e.PendingTransaction
  referenceAddress: AddressHash
}
