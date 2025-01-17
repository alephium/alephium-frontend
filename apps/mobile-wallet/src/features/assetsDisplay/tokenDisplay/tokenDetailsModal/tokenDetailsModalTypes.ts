import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'

import { ModalInstance } from '~/features/modals/modalTypes'

export interface TokenDetailsModalCommonProps {
  tokenId: Token['id']
  addressHash?: AddressHash
}

export interface TokenDetailsModalProps extends TokenDetailsModalCommonProps {
  parentModalId?: ModalInstance['id']
}
