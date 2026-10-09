import { selectAddressByHash, selectDefaultAddressHash } from '@alephium/shared/store'

import type { RootState } from '~/store/store'

export const selectSwapFromAddressHash = (state: RootState) =>
  state.swap.fromAddressHash ?? selectDefaultAddressHash(state)

export const selectSwapFromAddress = (state: RootState) => {
  const addressHash = selectSwapFromAddressHash(state)

  return addressHash ? selectAddressByHash(state, addressHash) : undefined
}
