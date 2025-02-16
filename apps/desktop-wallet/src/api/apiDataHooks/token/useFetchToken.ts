import { NFT } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { tokenQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, Token, TokenId, UnlistedFT } from '@/types/tokens'

const useFetchToken = (id: TokenId) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId }))

  return {
    data,
    isLoading
  }
}

export default useFetchToken

export const isFT = (token: Token): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: Token): token is ListedFT => (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: Token) => isFT(token) && !isListedFT(token)

export const isNFT = (token: Token): token is NFT => (token as NFT).nftIndex !== undefined
