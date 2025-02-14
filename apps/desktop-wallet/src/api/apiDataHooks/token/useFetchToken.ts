import { NFT } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { DataHook } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchFtList from '@/api/apiDataHooks/utils/useFetchFtList'
import { tokenQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, NonStandardToken, TokenId, UnlistedFT } from '@/types/tokens'

type UseFetchTokenResponse = DataHook<ListedFT | UnlistedFT | NFT | NonStandardToken>

const useFetchToken = (id: TokenId): UseFetchTokenResponse => {
  const { data: fTList, isLoading: isLoadingFtList } = useFetchFtList()
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const listedFt = fTList?.find((t) => t.id === id)

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId, isLoadingFtList, skip: !!listedFt }))

  return {
    data: listedFt ?? data ?? ({ id } as NonStandardToken),
    isLoading: isLoadingFtList || isLoading
  }
}

export default useFetchToken

export const isFT = (token: UseFetchTokenResponse['data']): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: UseFetchTokenResponse['data']): token is ListedFT =>
  (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: UseFetchTokenResponse['data']) => isFT(token) && !isListedFT(token)

export const isNFT = (token: UseFetchTokenResponse['data']): token is NFT => (token as NFT).nftIndex !== undefined
