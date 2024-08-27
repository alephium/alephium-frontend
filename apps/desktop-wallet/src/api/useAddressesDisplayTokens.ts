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

import { AddressHash } from '@alephium/shared'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useAddressesNFTs } from '@/api/addressesNftsDataHooks'
import { useAddressesUnlistedFTs, useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import useAddressesListedFTs from '@/api/apiDataHooks/useAddressesListedFTs'
import useAddressesTokensBalancesTotal from '@/api/apiDataHooks/useAddressesTokensBalancesTotal'
import useAddressesTokensWorth from '@/api/apiDataHooks/useAddressesTokensWorth'
import { ListedFTDisplay, NFTDisplay, NonStandardTokenDisplay, TokenDisplay, UnlistedFTDisplay } from '@/types/tokens'

const useAddressesDisplayTokens = (addressHash?: AddressHash) => {
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalancesTotal(addressHash)
  const { data: tokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: listedFTs, isLoading: isLoadingListedFTs } = useAddressesListedFTs(addressHash)
  const { data: unlistedFTs, isLoading: isLoadingUnlistedFTs } = useAddressesUnlistedFTs(addressHash)
  const { data: NFTs, isLoading: isLoadingNFTs } = useAddressesNFTs(addressHash)
  const { data: nonStandardTokens, isLoading: isLoadingNonStandardTokens } =
    useAddressesUnlistedNonStandardTokenIds(addressHash)

  return {
    isLoadingFTs: isLoadingTokensBalances || isLoadingTokensWorth || isLoadingListedFTs || isLoadingUnlistedFTs,
    isLoadingNFTs,
    isLoadingNonStandardTokens,
    data: useMemo(
      () => [
        ...orderBy(
          listedFTs.map((token) => {
            const balances = tokensBalances[token.id]

            return {
              type: 'listedFT',
              worth: tokensWorth[token.id],
              totalBalance: balances?.totalBalance ?? BigInt(0),
              lockedBalance: balances?.lockedBalance ?? BigInt(0),
              availableBalance: balances?.availableBalance ?? BigInt(0),
              ...token
            } as ListedFTDisplay
          }),
          [(token) => token.worth ?? -1, (token) => token.name.toLowerCase()],
          ['desc', 'asc']
        ),
        ...orderBy(
          unlistedFTs.map((token) => {
            const balances = tokensBalances[token.id]

            return {
              type: 'unlistedFT',
              totalBalance: balances?.totalBalance ?? BigInt(0),
              lockedBalance: balances?.lockedBalance ?? BigInt(0),
              availableBalance: balances?.availableBalance ?? BigInt(0),
              ...token
            } as UnlistedFTDisplay
          }),
          [(t) => t.name.toLowerCase(), 'id'],
          ['asc', 'asc']
        ),
        ...orderBy(
          NFTs.map((token) => ({ type: 'NFT', ...token }) as NFTDisplay),
          ['collectionId', (nft) => nft.name.toLowerCase()],
          ['asc', 'asc']
        ),
        ...orderBy(
          nonStandardTokens.map((tokenId) => {
            const balances = tokensBalances[tokenId]

            return {
              type: 'nonStandardToken',
              id: tokenId,
              totalBalance: balances?.totalBalance ?? BigInt(0),
              lockedBalance: balances?.lockedBalance ?? BigInt(0),
              availableBalance: balances?.availableBalance ?? BigInt(0)
            } as NonStandardTokenDisplay
          }),
          'id',
          'asc'
        )
      ],
      [NFTs, listedFTs, nonStandardTokens, tokensBalances, tokensWorth, unlistedFTs]
    )
  }
}

export default useAddressesDisplayTokens

export const getTokenDisplayData = (token: TokenDisplay) => ({
  image: token.type === 'NFT' ? token.image : token.type === 'listedFT' ? token.logoURI : undefined,
  name: token.type !== 'nonStandardToken' ? token.name : undefined,
  symbol: token.type === 'listedFT' || token.type === 'unlistedFT' ? token.symbol : undefined,
  amount: token.type !== 'NFT' ? token.availableBalance : undefined,
  decimals: token.type === 'listedFT' || token.type === 'unlistedFT' ? token.decimals : undefined,
  totalBalance: token.type !== 'NFT' ? token.totalBalance : undefined,
  lockedBalance: token.type !== 'NFT' ? token.lockedBalance : undefined,
  availableBalance: token.type !== 'NFT' ? token.availableBalance : undefined,
  worth: token.type === 'listedFT' ? token.worth : undefined
})
