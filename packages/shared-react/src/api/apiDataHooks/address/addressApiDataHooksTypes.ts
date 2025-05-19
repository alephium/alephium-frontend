import { AddressHash } from '@alephium/shared'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'

export interface UseFetchAddressProps extends SkipProp {
  addressHash: AddressHash
}
