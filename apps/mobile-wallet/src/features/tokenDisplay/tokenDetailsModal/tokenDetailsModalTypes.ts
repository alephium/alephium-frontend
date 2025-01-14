import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'

export interface TokenDetailsModalCommonProps {
  tokenId: Token['id']
  addressHash?: AddressHash
}
