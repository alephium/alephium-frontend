import { ONE_MINUTE_MS } from '@alephium/shared'
import { dehydrate } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { shouldDehydrateQuery } from '../src/api/persistQueryClientContext'
import { nftQuery, tokenQuery } from '../src/api/queries/tokenQueries'
import { queryClient } from '../src/api/queryClient'
import { invalidateTokenResolutionFallbacks } from '../src/api/queryInvalidation'

const { tokenTypeFetch, ftMetadataFetch, nftMetadataFetch } = vi.hoisted(() => ({
  tokenTypeFetch: vi.fn(),
  ftMetadataFetch: vi.fn(),
  nftMetadataFetch: vi.fn()
}))

vi.mock('@alephium/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@alephium/shared/api')>()),
  batchers: {
    tokenTypeBatcher: { fetch: tokenTypeFetch },
    ftMetadataBatcher: { fetch: ftMetadataFetch },
    nftMetadataBatcher: { fetch: nftMetadataFetch }
  }
}))

const TOKEN_ID = 'unlisted-token-id'
const NFT_ID = 'nft-token-id'
const NETWORK_ID = 0

const mockFetch = vi.fn()

// Makes every cached entry look older than the given age without touching timers, so that per-entry staleTime
// behavior can be asserted through public APIs only
const backdateQueryCache = (ageMs: number) => {
  const updatedAt = Date.now() - ageMs

  queryClient
    .getQueryCache()
    .getAll()
    .forEach((query) => queryClient.setQueryData(query.queryKey, (data: unknown) => data, { updatedAt }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mockFetch.mockReset()
  mockFetch.mockRejectedValue(new Error('network unreachable'))
})

afterEach(() => {
  queryClient.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  tokenTypeFetch.mockReset()
  ftMetadataFetch.mockReset()
  nftMetadataFetch.mockReset()
})

describe('tokenQuery resolved while the explorer is offline', () => {
  const offlineOptions = tokenQuery({ id: TOKEN_ID, networkId: NETWORK_ID, isExplorerOnline: false })
  const onlineOptions = tokenQuery({ id: TOKEN_ID, networkId: NETWORK_ID, isExplorerOnline: true })

  it('caches a flagged fallback that stays usable until its short staleTime elapses', async () => {
    const offlineResult = await queryClient.fetchQuery(offlineOptions)

    expect(offlineResult).toEqual({ id: TOKEN_ID, isResolutionFallback: true })

    const cachedResult = await queryClient.fetchQuery(onlineOptions)

    expect(cachedResult).toEqual({ id: TOKEN_ID, isResolutionFallback: true })
    expect(tokenTypeFetch).not.toHaveBeenCalled()
  })

  it('refetches the flagged fallback after its short staleTime and then stays Infinity-fresh', async () => {
    await queryClient.fetchQuery(offlineOptions)

    tokenTypeFetch.mockResolvedValue({ token: TOKEN_ID, stdInterfaceId: 'fungible' })
    ftMetadataFetch.mockResolvedValue({ id: TOKEN_ID, name: 'Test Token', symbol: 'TT', decimals: '6' })

    backdateQueryCache(ONE_MINUTE_MS + 1)
    const resolvedResult = await queryClient.fetchQuery(onlineOptions)

    expect(resolvedResult).toEqual({ id: TOKEN_ID, name: 'Test Token', symbol: 'TT', decimals: 6 })
    expect(tokenTypeFetch).toHaveBeenCalledTimes(1)

    backdateQueryCache(ONE_MINUTE_MS + 1)
    const freshResult = await queryClient.fetchQuery(onlineOptions)

    expect(freshResult).toEqual(resolvedResult)
    expect(tokenTypeFetch).toHaveBeenCalledTimes(1)
    expect(ftMetadataFetch).toHaveBeenCalledTimes(1)
  })
})

describe('nftQuery when the NFT data cannot be fetched', () => {
  const nftOptions = nftQuery({ id: NFT_ID, networkId: NETWORK_ID, isExplorerOnline: true })

  beforeEach(() => {
    nftMetadataFetch.mockResolvedValue({
      id: NFT_ID,
      tokenUri: 'https://example.com/nft.json',
      collectionId: 'collection-id',
      nftIndex: '1'
    })
  })

  it('caches a flagged "Unknown NFT" fallback and re-resolves it after its short staleTime', async () => {
    const fallbackResult = await queryClient.fetchQuery(nftOptions)

    expect(fallbackResult).toMatchObject({ id: NFT_ID, name: 'Unknown NFT', isResolutionFallback: true })

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ name: 'Cool NFT', image: '' })
    })

    backdateQueryCache(ONE_MINUTE_MS + 1)
    const resolvedResult = await queryClient.fetchQuery(nftOptions)

    expect(resolvedResult).toMatchObject({ id: NFT_ID, name: 'Cool NFT' })
    expect(resolvedResult?.isResolutionFallback).toBeUndefined()
    expect(nftMetadataFetch).toHaveBeenCalledTimes(1)

    backdateQueryCache(ONE_MINUTE_MS + 1)
    await queryClient.fetchQuery(nftOptions)

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('does not flag an NFT whose metadata host answered with an error status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })

    const result = await queryClient.fetchQuery(nftOptions)

    expect(result).toMatchObject({ id: NFT_ID, name: 'Unknown NFT' })
    expect(result?.isResolutionFallback).toBe(false)
  })

  it('does not flag an NFT with a malformed data: URI', async () => {
    nftMetadataFetch.mockResolvedValue({
      id: NFT_ID,
      tokenUri: 'data:application/json,{ this is not valid json',
      collectionId: 'collection-id',
      nftIndex: '1'
    })

    const result = await queryClient.fetchQuery(nftOptions)

    expect(result).toMatchObject({ id: NFT_ID, name: 'Unknown NFT' })
    expect(result?.isResolutionFallback).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

describe('invalidateTokenResolutionFallbacks', () => {
  it('invalidates exactly the flagged entries of the token namespace', async () => {
    queryClient.setQueryData(['token', 'flagged-id', { networkId: NETWORK_ID }], {
      id: 'flagged-id',
      isResolutionFallback: true
    })
    queryClient.setQueryData(['token', 'non-fungible', 'data', 'flagged-nft-id', { networkId: NETWORK_ID }], {
      id: 'flagged-nft-id',
      name: 'Unknown NFT',
      isResolutionFallback: true
    })
    queryClient.setQueryData(['token', 'real-id', { networkId: NETWORK_ID }], {
      id: 'real-id',
      name: 'Real Token',
      symbol: 'RT',
      decimals: 0
    })
    queryClient.setQueryData(['tokenPrices', 'currentPrice', 'ALPH'], 1.23)

    await invalidateTokenResolutionFallbacks()

    expect(queryClient.getQueryState(['token', 'flagged-id', { networkId: NETWORK_ID }])?.isInvalidated).toBe(true)
    expect(
      queryClient.getQueryState(['token', 'non-fungible', 'data', 'flagged-nft-id', { networkId: NETWORK_ID }])
        ?.isInvalidated
    ).toBe(true)
    expect(queryClient.getQueryState(['token', 'real-id', { networkId: NETWORK_ID }])?.isInvalidated).toBe(false)
    expect(queryClient.getQueryState(['tokenPrices', 'currentPrice', 'ALPH'])?.isInvalidated).toBe(false)
  })
})

describe('shouldDehydrateQuery', () => {
  it('excludes flagged fallback entries from persistence', () => {
    queryClient.setQueryData(['token', 'flagged-id', { networkId: NETWORK_ID }], {
      id: 'flagged-id',
      isResolutionFallback: true
    })
    queryClient.setQueryData(['token', 'real-id', { networkId: NETWORK_ID }], {
      id: 'real-id',
      name: 'Real Token',
      symbol: 'RT',
      decimals: 0
    })

    const dehydratedState = dehydrate(queryClient, { shouldDehydrateQuery })
    const dehydratedIds = dehydratedState.queries.map(({ queryKey }) => queryKey[1])

    expect(dehydratedIds).toEqual(['real-id'])
  })

  it('keeps excluding non-mainnet entries from persistence', async () => {
    await queryClient.fetchQuery({
      queryKey: ['testnet-query'],
      queryFn: () => 'testnet-data',
      meta: { isMainnet: false }
    })
    await queryClient.fetchQuery({
      queryKey: ['mainnet-query'],
      queryFn: () => 'mainnet-data',
      meta: { isMainnet: true }
    })

    const dehydratedState = dehydrate(queryClient, { shouldDehydrateQuery })
    const dehydratedKeys = dehydratedState.queries.map(({ queryKey }) => queryKey[0])

    expect(dehydratedKeys).toEqual(['mainnet-query'])
  })
})
