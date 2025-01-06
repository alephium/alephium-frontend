import { PRICED_TOKENS } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'
import { flatMap, uniq } from 'lodash'
import { useMemo } from 'react'

import { queries } from '@/api'
import { useVerifiedTokensMetadata } from '@/contexts/staticDataContext'
import { useQueriesData } from '@/hooks/useQueriesData'
import { UnverifiedNFTMetadata } from '@/types/assets'
import { alphMetadata } from '@/utils/assets'

export const useAssetMetadata = (assetId: string) => {
  const isAlph = assetId === ALPH.id

  const verifiedTokenMetadata = useVerifiedTokensMetadata()?.get(assetId)

  const { data: assetBaseRaw } = useQuery({
    ...queries.assets.type.one(assetId),
    enabled: !!assetId && !isAlph && !verifiedTokenMetadata
  })
  const assetType = assetBaseRaw?.type

  const { data: unverifiedFungibleTokenMetadata } = useQuery({
    ...queries.assets.metadata.unverifiedFungibleToken(assetId),
    enabled: !isAlph && !verifiedTokenMetadata && assetType === 'fungible'
  })

  const { data: unverifiedNFTMetadata } = useQuery({
    ...queries.assets.metadata.unverifiedNFT(assetId),
    enabled: !isAlph && !verifiedTokenMetadata && assetType === 'non-fungible'
  })

  const { data: nftData } = useQuery({
    ...queries.assets.NFTsData.item(unverifiedNFTMetadata?.tokenUri ?? '', assetId),
    enabled: !isAlph && assetType === 'non-fungible' && !!unverifiedNFTMetadata?.tokenUri
  })

  const unverifiedNFTMetadataWithFile =
    unverifiedNFTMetadata && nftData ? { ...unverifiedNFTMetadata, file: nftData } : undefined

  if (isAlph) return alphMetadata

  return (
    verifiedTokenMetadata ||
    unverifiedNFTMetadataWithFile ||
    unverifiedFungibleTokenMetadata || { id: assetId, type: undefined, verified: false }
  )
}

export const useAssetsMetadata = (assetIds: string[] = []) => {
  const allVerifiedTokensMetadata = useVerifiedTokensMetadata()

  const shouldExecuteQueries = assetIds.length > 0 && !!allVerifiedTokensMetadata

  const ids = assetIds.filter((id) => id !== ALPH.id)
  const isAlphIn = assetIds.length !== ids.length

  const verifiedTokensMetadata = Array.from(allVerifiedTokensMetadata || []).flatMap(([id, m]) =>
    assetIds.includes(id) ? m : []
  )

  const unverifiedAssetIds = ids.filter((id) => !verifiedTokensMetadata.some((vt) => vt.id === id))

  const { data: unverifiedAssets, isLoading: unverifiedAssetsLoading } = useQueriesData(
    unverifiedAssetIds.map((id) => ({
      ...queries.assets.type.one(id),
      enabled: !!id && shouldExecuteQueries
    }))
  )

  const { data: unverifiedTokensMetadata, isLoading: unverifiedTokensMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'fungible'
        ? { ...queries.assets.metadata.unverifiedFungibleToken(id), enabled: !!id && shouldExecuteQueries }
        : []
    )
  )

  const { data: unverifiedNFTsMetadata, isLoading: unverifiedNFTsMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'non-fungible'
        ? { ...queries.assets.metadata.unverifiedNFT(id), enabled: !!id && shouldExecuteQueries }
        : []
    )
  )

  const { data: NFTFiles } = useQueriesData(
    flatMap(unverifiedNFTsMetadata, ({ id, tokenUri }) => ({
      ...queries.assets.NFTsData.item(tokenUri, id),
      enabled: !!tokenUri
    }))
  )

  const unverifiedNFTsMetadataWithFiles: UnverifiedNFTMetadata[] = unverifiedNFTsMetadata.map((m) => {
    const file = NFTFiles.find((f) => f.assetId === m.id)

    return { ...m, file }
  })

  if (isAlphIn) {
    verifiedTokensMetadata.unshift(alphMetadata)
  }

  const knownAssetsIds = useMemo(
    () => [...verifiedTokensMetadata, ...unverifiedTokensMetadata, ...unverifiedNFTsMetadata].map((a) => a.id),
    [unverifiedNFTsMetadata, unverifiedTokensMetadata, verifiedTokensMetadata]
  )

  const unknownAssetsIds = useMemo(
    () => assetIds?.filter((id) => !knownAssetsIds.includes(id)) || [],
    [assetIds, knownAssetsIds]
  )

  const returnedVerifiedTokensMetadata = useMemo(
    () => ({
      fungibleTokens: verifiedTokensMetadata,
      nfts: [],
      unknown: [],
      isLoading: true
    }),
    [verifiedTokensMetadata]
  )

  const returnedCompleteMetadata = useMemo(
    () => ({
      fungibleTokens: [...verifiedTokensMetadata, ...unverifiedTokensMetadata],
      nfts: unverifiedNFTsMetadataWithFiles,
      unknown: unknownAssetsIds,
      isLoading:
        !allVerifiedTokensMetadata ||
        unverifiedAssetsLoading ||
        unverifiedTokensMetadataLoading ||
        unverifiedNFTsMetadataLoading
    }),
    [
      allVerifiedTokensMetadata,
      unknownAssetsIds,
      unverifiedAssetsLoading,
      unverifiedNFTsMetadataLoading,
      unverifiedNFTsMetadataWithFiles,
      unverifiedTokensMetadata,
      unverifiedTokensMetadataLoading,
      verifiedTokensMetadata
    ]
  )

  // Split the loading in 2 parts: first return verified tokens (fast to fetch), and then the rest when everything is ready
  if (
    (verifiedTokensMetadata && unverifiedAssetsLoading) ||
    unverifiedTokensMetadataLoading ||
    unverifiedNFTsMetadataLoading
  ) {
    return returnedVerifiedTokensMetadata
  } else return returnedCompleteMetadata
}

export const useTokensPrices = <T extends string>(assetSymbols: T[] = []) => {
  const tokensToFetch = uniq(assetSymbols).filter((symbol) => !!symbol && PRICED_TOKENS.includes(symbol))

  const { data: prices } = useQueriesData(
    tokensToFetch.map((symbol) => ({
      ...queries.assets.market.tokenPrice(symbol)
    }))
  )

  return tokensToFetch.reduce(
    (acc, symbol, i) => {
      acc[symbol] = prices[i]
      return acc
    },
    {} as Record<T, number>
  )
}
