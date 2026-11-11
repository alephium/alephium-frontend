import { selectAddressByHash, selectDefaultAddressHash } from '@alephium/shared/store'

import type { RootState } from '~/store/store'

export const selectStakingAddressHash = (state: RootState) =>
  state.staking.selectedAddressHash ?? selectDefaultAddressHash(state)

export const selectStakingAddress = (state: RootState) => {
  const addressHash = selectStakingAddressHash(state)

  return addressHash ? selectAddressByHash(state, addressHash) : undefined
}
