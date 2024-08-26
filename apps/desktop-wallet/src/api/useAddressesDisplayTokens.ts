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

import { useAddressesTotalTokensBalances } from '@/api/addressesBalancesDataHooks'
import { useAddressesListedFungibleTokens } from '@/api/addressesListedFungibleTokensDataHooks'
import { useAddressesNfts } from '@/api/addressesNftsDataHooks'
import { useAddressesTokensWorth } from '@/api/addressesTokensPricesDataHooks'
import {
  useAddressesUnlistedFungibleTokens,
  useAddressesUnlistedNonStandardTokenIds
} from '@/api/addressesUnlistedTokensHooks'
import { ListedFTDisplay, NFTDisplay, NonStandardTokenDisplay, TokenDisplay, UnlistedFTDisplay } from '@/types/tokens'

const useAddressesDisplayTokens = (addressHash?: AddressHash) => {
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTotalTokensBalances(addressHash)
  const { data: tokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: listedFTs, isLoading: isLoadingListedFTs } = useAddressesListedFungibleTokens(addressHash)
  const { data: unlistedFTs, isLoading: isLoadingUnlistedFTs } = useAddressesUnlistedFungibleTokens(addressHash)
  const { data: NFTs, isLoading: isLoadingNFTs } = useAddressesNfts(addressHash)
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
            const availableBalance = balances ? balances.balance - balances.lockedBalance : undefined

            return {
              type: 'listedFT',
              worth: tokensWorth[token.id],
              balance: balances?.balance,
              availableBalance,
              ...token
            } as ListedFTDisplay
          }),
          [(token) => token.worth ?? -1, (token) => token.name.toLowerCase()],
          ['desc', 'asc']
        ),
        ...orderBy(
          unlistedFTs.map((token) => {
            const balances = tokensBalances[token.id]
            const availableBalance = balances ? balances.balance - balances.lockedBalance : undefined

            return { type: 'unlistedFT', availableBalance, balance: balances?.balance, ...token } as UnlistedFTDisplay
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
            const availableBalance = balances ? balances.balance - balances.lockedBalance : undefined

            return {
              type: 'nonStandardToken',
              id: tokenId,
              balance: balances?.balance,
              availableBalance
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
  balance: token.type !== 'NFT' ? token.balance : undefined,
  availableBalance: token.type !== 'NFT' ? token.availableBalance : undefined,
  worth: token.type === 'listedFT' ? token.worth : undefined
})
