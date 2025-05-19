import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

export type ConfirmedTransactionListItemBaseProps = {
  tx: e.Transaction
  refAddressHash?: AddressHash
}

export type ConfirmedTransactionListItemSubcomponentProps = Required<ConfirmedTransactionListItemBaseProps>
