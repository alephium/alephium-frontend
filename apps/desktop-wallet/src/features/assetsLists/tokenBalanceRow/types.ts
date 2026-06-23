import { AddressHash } from '@alephium/shared/types'

export interface TokenBalancesRowBaseProps {
  tokenId: string
}

interface AddressHashProp {
  addressHash: AddressHash
}

export type AddressTokenBalancesRowProps = AddressHashProp & TokenBalancesRowBaseProps
