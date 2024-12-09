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

import { explorer, NFTTokenUriMetaData } from '@alephium/web3'
import { isArray, orderBy } from 'lodash'
import sanitize from 'sanitize-html'

import { calculateAmountWorth } from '@/numbers'
import { Asset, FungibleToken, NFT, TokenDisplayBalances, TokenPriceEntity } from '@/types'

export const PRICED_TOKENS = Object.keys(explorer.TokensWithPrice)

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

export const matchesNFTTokenUriMetaDataSchema = (nft: NFTTokenUriMetaData) =>
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

export const sanitizeNft = (nft: NFT): NFT => ({
  ...nft,
  name: sanitize(nft.name),
  description: nft.description ? sanitize(nft.description) : nft.description,
  image: sanitize(nft.image),
  attributes: nft.attributes?.map(({ trait_type, value }) => ({
    trait_type: sanitize(trait_type),
    value: sanitize(value.toString())
  }))
})
