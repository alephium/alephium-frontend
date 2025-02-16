import { NFT } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { DataHook } from '@/api/apiDataHooks/apiDataHooksTypes'
import { tokenQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, NonStandardToken, TokenId, UnlistedFT } from '@/types/tokens'

type UseFetchTokenResponse = DataHook<ListedFT | UnlistedFT | NFT | NonStandardToken>

const useFetchToken = (id: TokenId): UseFetchTokenResponse => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId }))

  return {
    data: data ?? ({ id } as NonStandardToken),
    isLoading
  }
}

export default useFetchToken

export const isFT = (token: UseFetchTokenResponse['data']): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: UseFetchTokenResponse['data']): token is ListedFT =>
  (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: UseFetchTokenResponse['data']) => isFT(token) && !isListedFT(token)

export const isNFT = (token: UseFetchTokenResponse['data']): token is NFT => (token as NFT).nftIndex !== undefined
