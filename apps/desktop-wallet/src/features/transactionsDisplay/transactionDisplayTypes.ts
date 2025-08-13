import { AddressHash, ExecuteScriptTx } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

export interface TransactionDisplayProps {
  tx: e.AcceptedTransaction | e.PendingTransaction | ExecuteScriptTx
  referenceAddress: AddressHash
}
