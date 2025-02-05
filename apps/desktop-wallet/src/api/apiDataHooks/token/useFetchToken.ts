import { NFT } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'

import { DataHook } from '@/api/apiDataHooks/apiDataHooksTypes'
import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import useFetchFtList from '@/api/apiDataHooks/utils/useFetchFtList'
import { fungibleTokenMetadataQuery, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { ListedFT, NonStandardToken, TokenId, UnlistedFT } from '@/types/tokens'

type UseFetchTokenResponse = DataHook<ListedFT | UnlistedFT | NFT | NonStandardToken>

const useFetchToken = (id: TokenId): UseFetchTokenResponse => {
  const { data: fTList, isLoading: isLoadingFtList } = useFetchFtList()
  const networkId = useCurrentlyOnlineNetworkId()

  const listedFT = fTList?.find((t) => t.id === id)

  const { data: tokenType, isLoading: isLoadingTokenType } = useQuery(
    tokenTypeQuery({ id, networkId, skip: isLoadingFtList || !!listedFT })
  )

  const { data: unlistedFT, isLoading: isLoadingUnlistedFT } = useQuery(
    fungibleTokenMetadataQuery({
      id,
      networkId,
      skip: isLoadingTokenType || tokenType?.stdInterfaceId !== e.TokenStdInterfaceId.Fungible
    })
  )

  const { data: nft, isLoading: isLoadingNft } = useFetchNft({
    id,
    skip: isLoadingTokenType || tokenType?.stdInterfaceId !== e.TokenStdInterfaceId.NonFungible
  })

  return {
    data: listedFT ?? unlistedFT ?? nft ?? { id },
    isLoading: isLoadingFtList || isLoadingTokenType || isLoadingUnlistedFT || isLoadingNft
  }
}

export default useFetchToken

export const isFT = (token: UseFetchTokenResponse['data']): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: UseFetchTokenResponse['data']): token is ListedFT =>
  (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: UseFetchTokenResponse['data']) => isFT(token) && !isListedFT(token)

export const isNFT = (token: UseFetchTokenResponse['data']): token is NFT => (token as NFT).nftIndex !== undefined
