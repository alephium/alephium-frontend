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

import { orderBy } from 'lodash'

import { calculateAmountWorth } from '@/numbers'
import {
  Asset,
  FungibleToken,
  ListedFungibleToken,
  NFT,
  TokenDisplayBalances,
  TokenPriceEntity,
  UnknownAsset
} from '@/types'

export const tokenIsFungible = (asset: Partial<Asset | NFT>): asset is Asset => 'decimals' in asset

export const tokenIsKnownFungible = (asset: Partial<Asset | NFT>): asset is Asset =>
  tokenIsFungible(asset) && 'symbol' in asset

export const tokenIsNonFungible = (asset: Partial<Asset | NFT>): asset is NFT => 'collectionId' in asset

export const tokenIsListed = (asset: Partial<Asset | NFT>): asset is ListedFungibleToken => 'logoURI' in asset

// Todo: rename "unknown" to "uncategorized"?
export const tokenIsUnknown = (asset: Partial<Asset | NFT>): asset is UnknownAsset =>
  !tokenIsKnownFungible(asset) && !tokenIsNonFungible(asset)

export const sortAssets = (assets: Asset[]) =>
  orderBy(
    assets,
    [(a) => (tokenIsListed(a) ? 1 : 0), (a) => a.worth ?? -1, (a) => a.name?.toLowerCase(), 'id'],
    ['desc', 'desc', 'asc', 'asc']
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
