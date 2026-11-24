import { Address, AddressHash } from '@alephium/shared/types'
import { useNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { fetchSweepTransactionsFees } from '~/api/transactions'

interface UseFetchMigrationSweepFeeProps {
  fromAddress?: Address
  toAddressHash?: AddressHash
  enabled?: boolean
}

const useFetchMigrationSweepFee = ({ fromAddress, toAddressHash, enabled = true }: UseFetchMigrationSweepFeeProps) => {
  const networkId = useNetworkId()

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['addressMigrationSweepFee', networkId, fromAddress?.hash, toAddressHash],
    queryFn: () =>
      fetchSweepTransactionsFees({
        signerAddress: fromAddress!.hash,
        signerKeyType: fromAddress!.keyType,
        toAddress: toAddressHash!
      }),
    enabled: enabled && !!fromAddress && !!toAddressHash,
    retry: false,
    staleTime: 60_000
  })

  return { fee: data, error, isLoading, refetch }
}

export default useFetchMigrationSweepFee
