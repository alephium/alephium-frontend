import { AddressHash, TokenId } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'

import { useFetchAddressBalancesAlph } from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { addressTokensBalancesQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

interface UseFetchAddressSingleTokenBalancesProps extends SkipProp {
  addressHash: AddressHash
  tokenId: TokenId
}

export const useFetchAddressSingleTokenBalances = ({
  addressHash,
  tokenId,
  skip
}: UseFetchAddressSingleTokenBalancesProps) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const isALPH = tokenId === ALPH.id

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash,
    skip
  })

  const { data: addressTokenBalances, isLoading: isLoadingTokenBalances } = useQuery({
    ...addressTokensBalancesQuery({ addressHash, networkId }),
    select: (data) => data?.balances.find(({ id }) => id === tokenId)
  })

  return {
    data: isALPH ? alphBalances : addressTokenBalances,
    isLoading: isALPH ? isLoadingAlphBalances : isLoadingTokenBalances
  }
}
