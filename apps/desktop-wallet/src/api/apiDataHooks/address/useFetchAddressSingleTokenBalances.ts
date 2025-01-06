import { AddressHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { addressTokensBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { TokenId } from '@/types/tokens'

interface UseFetchAddressSingleTokenBalancesProps extends SkipProp {
  addressHash: AddressHash
  tokenId: TokenId
}

const useFetchAddressSingleTokenBalances = ({
  addressHash,
  tokenId,
  skip
}: UseFetchAddressSingleTokenBalancesProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const isALPH = tokenId === ALPH.id

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash,
    skip
  })

  const { data: addressTokenBalances, isLoading: isLoadingTokenBalances } = useQuery({
    ...addressTokensBalancesQuery({ addressHash, networkId, skip: skip || isALPH }),
    select: (data) => data?.balances.find(({ id }) => id === tokenId)
  })

  return {
    data: isALPH ? alphBalances : addressTokenBalances,
    isLoading: isALPH ? isLoadingAlphBalances : isLoadingTokenBalances
  }
}

export default useFetchAddressSingleTokenBalances
