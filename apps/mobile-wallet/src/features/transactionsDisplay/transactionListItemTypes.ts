import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

export type ConfirmedTransactionListItemBaseProps = {
  tx: e.Transaction
  referenceAddress?: AddressHash
}

export type ConfirmedTransactionListItemSubcomponentProps = Required<ConfirmedTransactionListItemBaseProps>
