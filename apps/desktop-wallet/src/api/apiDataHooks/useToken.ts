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

import useFTList from '@/api/apiDataHooks/useFTList'
import useNFT from '@/api/apiDataHooks/useNFT'
import { fungibleTokenMetadataQuery, tokenTypeQuery } from '@/api/queries/tokenQueries'
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

  const { data: nft, isLoading: isLoadingNft } = useNFT({
    id,
    skip: isLoadingTokenType || tokenType?.stdInterfaceId !== explorer.TokenStdInterfaceId.NonFungible
  })

  return {
    data: listedFT ?? unlistedFT ?? nft ?? { id },
    isLoading: isLoadingFtList || isLoadingTokenType || isLoadingUnlistedFT || isLoadingNft
  }
}

export default useToken

export const isFT = (token: Token['data']): token is ListedFT | UnlistedFT =>
  (token as ListedFT | UnlistedFT).symbol !== undefined

export const isListedFT = (token: Token['data']): token is ListedFT => (token as ListedFT).logoURI !== undefined

export const isUnlistedFT = (token: Token['data']) => isFT(token) && !isListedFT(token)

export const isNFT = (token: Token['data']): token is NFT => (token as NFT).nftIndex !== undefined
