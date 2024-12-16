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
import { explorer as e } from '@alephium/web3'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import { fungibleTokenMetadataQuery, nftDataQuery, nftMetadataQuery } from '@/api/queries/tokenQueries'
import useTransactionAmountDeltas from '@/features/transactionsDisplay/useTransactionAmountDeltas'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, NonStandardToken, UnlistedFT } from '@/types/tokens'

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

const useFetchTransactionTokens = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash
): TransactionTokens => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, addressHash)

  const {
    data: { listedFts, unlistedTokens, unlistedFtIds, nftIds },
    isLoading: isLoadingTokensByType
  } = useFetchTokensSeparatedByType(tokenAmounts)

  const { data: unlistedFts, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFtIds.map((id) => fungibleTokenMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const { data: nftsMetadata, isLoading: isLoadingNFTsMetadata } = useQueries({
    queries: nftIds.map((id) => nftMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const { data: nftsData, isLoading: isLoadingNFTsData } = useQueries({
    queries: nftsMetadata.map(({ id, tokenUri }) => nftDataQuery({ id, tokenUri, networkId })),
    combine: combineDefined
  })

  const data = useMemo(() => {
    const initial = {
      fungibleTokens: [{ ...ALPH, amount: alphAmount }, ...listedFts] as TxFT[],
      nfts: [] as TxNFT[],
      nsts: [] as TxNST[]
    }

    return unlistedTokens.reduce((acc, { id, amount }) => {
      const unlistedFT = unlistedFts.find((t) => t.id === id)

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
  }, [alphAmount, listedFts, nftsData, nftsMetadata, unlistedFts, unlistedTokens])

  return {
    data,
    isLoading: isLoadingTokensByType || isLoadingUnlistedFTs || isLoadingNFTsMetadata || isLoadingNFTsData
  }
}

export default useFetchTransactionTokens
