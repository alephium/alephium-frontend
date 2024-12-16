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

import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { nftDataQuery, nftMetadataQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { TokenId } from '@/types/tokens'

const useFetchWalletNftsSearchStrings = () => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const {
    data: { nftIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeAlph: true })

  const { data: nftsMetadata, isLoading: isLoadingNftsMetadata } = useQueries({
    queries: nftIds.map((id) => nftMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const { data: nftsData, isLoading: isLoadingNftsData } = useQueries({
    queries: nftsMetadata.map(({ id, tokenUri }) =>
      nftDataQuery({ id, tokenUri, networkId, skip: isLoadingNftsMetadata })
    ),
    combine: combineDefined
  })

  const nftsSearchStringsByNftId = useMemo(
    () =>
      nftsData.reduce(
        (acc, { id, name }) => {
          acc[id] = `${id} ${name}`

          return acc
        },
        {} as Record<TokenId, string>
      ),
    [nftsData]
  )

  return {
    data: nftsSearchStringsByNftId,
    isLoading: isLoadingNftsMetadata || isLoadingNftsData || isLoadingTokensByType
  }
}

export default useFetchWalletNftsSearchStrings
