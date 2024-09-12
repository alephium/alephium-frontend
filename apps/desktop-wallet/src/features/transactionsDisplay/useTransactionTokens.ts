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

import { AddressHash, NFT } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { TokenInfo, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import useFTList from '@/api/apiDataHooks/useFTList'
import { combineIsLoading, mapCombineDefined } from '@/api/apiDataHooks/utils'
import {
  fungibleTokenMetadataQuery,
  nftDataQuery,
  nftMetadataQuery,
  StdInterfaceIds,
  tokenTypeQuery
} from '@/api/queries/tokenQueries'
import { ListedFT, NonStandardToken, TokenId, UnlistedFT } from '@/types/tokens'
import { PendingTransaction } from '@/types/transactions'
import { useTransactionAmountDeltas } from '@/utils/transactions'

type AmountDelta = { amount: bigint }
type TxFT = TxListedFT | TxUnlistedFT
type TxListedFT = ListedFT & AmountDelta
type TxUnlistedFT = UnlistedFT & AmountDelta
type TxNFT = NFT & AmountDelta
type TxNST = NonStandardToken & AmountDelta

type TransactionTokens = {
  data: {
    fungibleTokens: TxFT[]
    nfts: TxNFT[]
    nsts: TxNST[]
  }
  isLoading: boolean
}

const useTransactionTokens = (tx: Transaction | PendingTransaction, addressHash: AddressHash): TransactionTokens => {
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, addressHash)

  const { data: ftList, isLoading: isLoadingFtList } = useFTList()

  const { listedFTs, unlistedTokens } = useMemo(() => {
    const initial = { listedFTs: [] as TxListedFT[], unlistedTokens: [] as TxNST[] }

    if (!ftList) return initial

    return tokenAmounts.reduce((acc, { id, amount }) => {
      const listedFT = ftList?.find((t) => t.id === id)

      if (listedFT) {
        acc.listedFTs.push({ ...listedFT, amount })
      } else {
        acc.unlistedTokens.push({ id, amount })
      }

      return acc
    }, initial)
  }, [ftList, tokenAmounts])

  const {
    data: { fungible: unlistedFTIds, 'non-fungible': nftIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenTypeQuery({ id })),
    combine
  })

  const { data: unlistedFTs, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFTIds.map((id) => fungibleTokenMetadataQuery({ id })),
    combine: mapCombineDefined
  })

  const { data: nftsMetadata, isLoading: isLoadingNFTsMetadata } = useQueries({
    queries: nftIds.map((id) => nftMetadataQuery({ id })),
    combine: mapCombineDefined
  })

  const { data: nftsData, isLoading: isLoadingNFTsData } = useQueries({
    queries: nftsMetadata.map(({ id, tokenUri }) => nftDataQuery({ id, tokenUri })),
    combine: mapCombineDefined
  })

  const data = useMemo(() => {
    const initial = {
      fungibleTokens: [{ ...ALPH, amount: alphAmount }, ...listedFTs] as TxFT[],
      nfts: [] as TxNFT[],
      nsts: [] as TxNST[]
    }

    return unlistedTokens.reduce((acc, { id, amount }) => {
      const unlistedFT = unlistedFTs.find((t) => t.id === id)

      if (unlistedFT) {
        acc.fungibleTokens.push({ ...unlistedFT, amount })

        return acc
      }

      const nftMetadata = nftsMetadata.find((t) => t.id === id)

      if (nftMetadata) {
        const nftData = nftsData.find((t) => t.id === id)

        if (nftData) {
          acc.nfts.push({ ...nftMetadata, ...nftData, amount })

          return acc
        }
      }

      acc.nsts.push({ id, amount })

      return acc
    }, initial)
  }, [alphAmount, listedFTs, nftsData, nftsMetadata, unlistedFTs, unlistedTokens])

  return {
    data,
    isLoading:
      isLoadingFtList || isLoadingTokensByType || isLoadingUnlistedFTs || isLoadingNFTsMetadata || isLoadingNFTsData
  }
}

export default useTransactionTokens

const combine = (results: UseQueryResult<TokenInfo | undefined>[]) => ({
  data: results.reduce(
    (tokenIdsByType, { data: tokenInfo }) => {
      if (!tokenInfo) return tokenIdsByType
      const stdInterfaceId = tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId

      if (StdInterfaceIds.includes(stdInterfaceId)) {
        tokenIdsByType[stdInterfaceId].push(tokenInfo.token)
      } else {
        // Except from NonStandard, the interface might be any string or undefined. We merge all that together.
        tokenIdsByType[explorer.TokenStdInterfaceId.NonStandard].push(tokenInfo.token)
      }

      return tokenIdsByType
    },
    {
      [explorer.TokenStdInterfaceId.Fungible]: [],
      [explorer.TokenStdInterfaceId.NonFungible]: [],
      [explorer.TokenStdInterfaceId.NonStandard]: []
    } as Record<explorer.TokenStdInterfaceId, TokenId[]>
  ),
  ...combineIsLoading(results)
})
