import { queryClient } from '@/api/queryClient'

// Queries need to be invalidated in order of dependency
export const invalidateAddressQueries = async (address: string) => {
  await queryClient.invalidateQueries({ queryKey: ['address', address, 'level:0'] })
  await queryClient.invalidateQueries({ queryKey: ['address', address, 'level:1'] })
  await queryClient.invalidateQueries({ queryKey: ['address', address, 'level:2'] })
  await queryClient.invalidateQueries({ queryKey: ['address', address, 'level:3'] })
  await queryClient.invalidateQueries({ queryKey: ['address', address, 'level:4'] })
}

export const invalidateWalletQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] })
}
