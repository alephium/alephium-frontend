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

import { TokenInfo } from '@alephium/token-list'
import { orderBy } from 'lodash'

import { calculateAmountWorth } from '@/numbers'
import { Asset, FungibleToken, NFT, TokenDisplayBalances, TokenPriceEntity } from '@/types'

export const isFungible = (asset: Partial<TokenInfo | NFT>): asset is TokenInfo => 'decimals' in asset

export const isNonFungible = (asset: Partial<TokenInfo | NFT>): asset is NFT => 'collectionId' in asset

export const sortAssets = (assets: Asset[]) =>
  orderBy(
    assets,
    [
      (a) => (a.verified ? 0 : 1),
      (a) => a.worth ?? -1,
      (a) => a.verified === undefined,
      (a) => a.name?.toLowerCase(),
      'id'
    ],
    ['asc', 'desc', 'asc', 'asc', 'asc']
  )

export const calculateAssetsData = (
  tokenBalances: TokenDisplayBalances[],
  fungibleTokens: FungibleToken[],
  nfts: NFT[],
  tokenPrices: TokenPriceEntity[]
) =>
  tokenBalances.reduce((acc, token) => {
    const fungibleToken = fungibleTokens.find((t) => t.id === token.id)
    const nftInfo = nfts.find((nft) => nft.id === token.id)
    const decimals = fungibleToken?.decimals ?? 0
    const balance = BigInt(token.balance.toString())
    const tokenPrice =
      fungibleToken?.verified && fungibleToken?.symbol
        ? tokenPrices.find((t) => t.symbol === fungibleToken.symbol)
        : undefined
    const worth =
      tokenPrice !== undefined && tokenPrice.price !== null
        ? calculateAmountWorth(balance, tokenPrice.price, decimals)
        : undefined

    acc.push({
      id: token.id,
      balance,
      lockedBalance: BigInt(token.lockedBalance.toString()),
      name: fungibleToken?.name ?? nftInfo?.name,
      symbol: fungibleToken?.symbol,
      description: fungibleToken?.description ?? nftInfo?.description,
      logoURI: fungibleToken?.logoURI ?? nftInfo?.image,
      decimals,
      verified: fungibleToken?.verified,
      worth
    })

    return acc
  }, [] as Asset[])
