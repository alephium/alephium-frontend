import { AddressHash } from '@alephium/shared/types'

import { SkipProp } from '../../../api/apiDataHooks/apiDataHooksTypes'

export interface UseFetchAddressProps extends SkipProp {
  addressHash: AddressHash
}
