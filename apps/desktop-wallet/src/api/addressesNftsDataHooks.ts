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

import { AddressHash, client, NFT, ONE_DAY_MS, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { NFTTokenUriMetaData } from '@alephium/web3'
import { useQueries } from '@tanstack/react-query'
import axios from 'axios'
import { chunk, isArray } from 'lodash'

import useAddressesUnlistedTokenTypes from '@/api/apiDataHooks/useAddressesUnlistedTokenTypes'
import { isDefined } from '@/utils/misc'

export const useAddressesNFTsIds = (addressHash?: AddressHash) => {
  const {
    data: { 'non-fungible': nftIds },
    isLoading
  } = useAddressesUnlistedTokenTypes(addressHash)

  return {
    data: nftIds,
    isLoading
  }
}

export const useAddressesNFTs = (addressHash?: AddressHash) => {
  const { data: nftIds, isLoading: isLoadingNftIds } = useAddressesNFTsIds(addressHash)

  const { data: nftsMetadata, isLoading: isLoadingNftsMetadata } = useQueries({
    queries: chunk(nftIds, TOKENS_QUERY_LIMIT).map((ids) => ({
      queryKey: ['tokens', 'non-fungible', 'metadata', ids],
      queryFn: () => client.explorer.tokens.postTokensNftMetadata(ids),
      staleTime: Infinity
    })),
    combine: (results) => ({
      data: results.flatMap(({ data }) => data).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  const { data: nfts, isLoading: isLoadingNftsData } = useQueries({
    queries: nftsMetadata.map(({ tokenUri, ...nftMetadata }) => ({
      queryKey: ['tokens', 'non-fungible', 'data', tokenUri],
      queryFn: async () => {
        const nftData = (await axios.get(tokenUri)).data as NFTTokenUriMetaData

        return {
          ...nftMetadata,
          ...(matchesNFTTokenUriMetaDataSchema(nftData)
            ? nftData
            : {
                name: nftData?.name.toString() || 'Unsupported NFT',
                image: nftData?.image.toString() || ''
              })
        } as NFT
      },
      staleTime: ONE_DAY_MS
    })),
    combine: (results) => ({
      data: results.map(({ data }) => data).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data: nfts,
    isLoading: isLoadingNftIds || isLoadingNftsMetadata || isLoadingNftsData
  }
}

const matchesNFTTokenUriMetaDataSchema = (nft: NFTTokenUriMetaData) =>
  typeof nft.name === 'string' &&
  typeof nft.image === 'string' &&
  (typeof nft.description === 'undefined' || typeof nft.description === 'string') &&
  (typeof nft.attributes === 'undefined' ||
    (isArray(nft.attributes) &&
      nft.attributes.every(
        (attr) =>
          typeof attr.trait_type === 'string' &&
          (typeof attr.value === 'string' || typeof attr.value === 'number' || typeof attr.value === 'boolean')
      )))
