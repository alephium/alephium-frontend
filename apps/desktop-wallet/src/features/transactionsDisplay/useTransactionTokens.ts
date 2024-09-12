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
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import useSeparateListedFromUnlistedTokens from '@/api/apiDataHooks/useSeparateListedFromUnlistedTokens'
import { mapCombineDefined } from '@/api/apiDataHooks/utils'
import {
  combineTokenTypeQueryResults,
  fungibleTokenMetadataQuery,
  nftDataQuery,
  nftMetadataQuery,
  tokenTypeQuery
} from '@/api/queries/tokenQueries'
import { ListedFT, NonStandardToken, UnlistedFT } from '@/types/tokens'
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

  const {
    data: { listedFTs: listedFTsAmounts, unlistedTokens: unlistedTokensAmounts },
    isLoading: isLoadingFtList
  } = useSeparateListedFromUnlistedTokens(tokenAmounts)

  const {
    data: { fungible: unlistedFTIds, 'non-fungible': nftIds },
    isLoading: isLoadingTokensByType
  } = useQueries({
    queries: unlistedTokensAmounts.map(({ id }) => tokenTypeQuery({ id })),
    combine: combineTokenTypeQueryResults
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
      fungibleTokens: [{ ...ALPH, amount: alphAmount }, ...listedFTsAmounts] as TxFT[],
      nfts: [] as TxNFT[],
      nsts: [] as TxNST[]
    }

    return unlistedTokensAmounts.reduce((acc, { id, amount }) => {
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
  }, [alphAmount, listedFTsAmounts, nftsData, nftsMetadata, unlistedFTs, unlistedTokensAmounts])

  return {
    data,
    isLoading:
      isLoadingFtList || isLoadingTokensByType || isLoadingUnlistedFTs || isLoadingNFTsMetadata || isLoadingNFTsData
  }
}

export default useTransactionTokens
