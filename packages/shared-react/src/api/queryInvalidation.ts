import { AddressHash } from '@alephium/shared'

import { queryClient } from '@/api/queryClient'

// Queries need to be invalidated in order of dependency
export const invalidateAddressQueries = async (addressHash: AddressHash) => {
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:0'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:1'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:2'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:3'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:4'] })
}

export const invalidateWalletQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
}
