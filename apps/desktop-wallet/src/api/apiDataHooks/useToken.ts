/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { NFT } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import useFTList from '@/api/apiDataHooks/useFTList'
import { fungibleTokenMetadataQuery, nftDataQuery, nftMetadataQuery, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { ListedFT, NonStandardToken, TokenId, UnlistedFT } from '@/types/tokens'

type Token = {
  data: ListedFT | UnlistedFT | NFT | NonStandardToken
  isLoading: boolean
}

const useToken = (id: TokenId): Token => {
  const { data: fTList, isLoading: isLoadingFtList } = useFTList()

  const listedFT = fTList?.find((t) => t.id === id)

  const { data: tokenType, isLoading: isLoadingTokenType } = useQuery(
    tokenTypeQuery({ id, skip: isLoadingFtList || !!listedFT })
  )

  const { data: unlistedFT, isLoading: isLoadingUnlistedFT } = useQuery(
    fungibleTokenMetadataQuery({
      id,
      skip: isLoadingTokenType || tokenType?.stdInterfaceId !== explorer.TokenStdInterfaceId.Fungible
    })
  )

  const { data: nftMetadata, isLoading: isLoadingNftMetadata } = useQuery(
    nftMetadataQuery({
      id,
      skip: isLoadingTokenType || tokenType?.stdInterfaceId !== explorer.TokenStdInterfaceId.NonFungible
    })
  )

  const { data: nftData, isLoading: isLoadingNftData } = useQuery(
    nftDataQuery({
      id,
      tokenUri: nftMetadata?.tokenUri,
      skip: isLoadingNftMetadata || tokenType?.stdInterfaceId !== explorer.TokenStdInterfaceId.NonFungible
    })
  )

  const nft = useMemo(
    () =>
      !!nftMetadata && !!nftData
        ? ({
            ...nftMetadata,
            ...nftData
          } as NFT)
        : undefined,
    [nftData, nftMetadata]
  )

  return {
    data: listedFT
      ? (listedFT as ListedFT)
      : unlistedFT
        ? (unlistedFT as UnlistedFT)
        : nft || ({ id } as NonStandardToken),
    isLoading: isLoadingFtList || isLoadingTokenType || isLoadingUnlistedFT || isLoadingNftMetadata || isLoadingNftData
  }
}

export default useToken

export const isListedFT = (token: Token['data']): token is ListedFT => (token as ListedFT).logoURI !== undefined

export const isFT = (token: Token['data']): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isNFT = (token: Token['data']): token is NFT => (token as NFT).nftIndex !== undefined
