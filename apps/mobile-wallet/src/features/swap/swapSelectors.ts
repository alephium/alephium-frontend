import { selectDefaultAddressHash } from '@alephium/shared/store'

import type { RootState } from '~/store/store'

export const selectSwapFromAddressHash = (state: RootState) =>
  state.swap.fromAddressHash ?? selectDefaultAddressHash(state)
