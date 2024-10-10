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

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { nftDataQuery, nftMetadataQuery } from '@/api/queries/tokenQueries'
import { TokenId } from '@/types/tokens'

interface UseNFTProps extends SkipProp {
  id: TokenId
}

const useFetchNft = ({ id, skip }: UseNFTProps) => {
  const { data: nftMetadata, isLoading: isLoadingNftMetadata } = useQuery(nftMetadataQuery({ id, skip }))

  const {
    data: nftData,
    isLoading: isLoadingNftData,
    error
  } = useQuery(nftDataQuery({ id, tokenUri: nftMetadata?.tokenUri, skip: skip || isLoadingNftMetadata }))

  return {
    data: useMemo(
      () =>
        !!nftMetadata && !!nftData
          ? {
              ...nftMetadata,
              ...nftData
            }
          : undefined,
      [nftData, nftMetadata]
    ),
    isLoading: isLoadingNftMetadata || isLoadingNftData,
    error,
    nftMetadata
  }
}

export default useFetchNft
