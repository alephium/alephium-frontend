import { selectDefaultAddressHash } from '@alephium/shared/store'

import type { RootState } from '~/store/store'

export const selectStakingAddressHash = (state: RootState) =>
  state.staking.selectedAddressHash ?? selectDefaultAddressHash(state)
