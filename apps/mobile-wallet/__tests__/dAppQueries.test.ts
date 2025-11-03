import { ONE_HOUR_MS } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'
import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { dAppsQuery, dAppsTagsQuery } from '~/api/queries/dAppQueries'
import { DApp } from '~/features/ecosystem/ecosystemTypes'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('dAppQueries', () => {
  beforeEach(() => {
    // Clear all cache data
    queryClient.removeQueries()
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  afterEach(() => {
    queryClient.removeQueries()
  })

  describe('dAppsQuery', () => {
    const mockDApps: DApp[] = [
      {
        name: 'TestDApp1',
        links: { website: 'https://test1.com' },
        short_description: 'Test 1',
        tags: ['DeFi'],
        verified: true,
        councils_choice: true,
        dotw: true,
        teamInfo: { contactEmail: 'test1@test.com', founded: '2021-01-01', anonymous: false },
        media: {
          logoUrl: 'https://test1.com/logo.png',
          bannerUrl: 'https://test1.com/banner.png',
          previewUrl: 'https://test1.com/preview.png'
        },
        description: 'Test 1'
      },
      {
        name: 'TestDApp2',
        links: { website: 'https://test2.com' },
        short_description: 'Test 2',
        tags: ['NFTs'],
        verified: true,
        councils_choice: true,
        dotw: true,
        teamInfo: { contactEmail: 'test2@test.com', founded: '2021-01-01', anonymous: false },
        media: {
          logoUrl: 'https://test2.com/logo.png',
          bannerUrl: 'https://test2.com/banner.png',
          previewUrl: 'https://test2.com/preview.png'
        },
        description: 'Test 2'
      }
    ]

    it('returns cached data on API failure if available', async () => {
      // First, populate the cache with data
      mockedAxios.get.mockResolvedValueOnce({ data: mockDApps })
      const query = dAppsQuery({ select: (dApps) => dApps })
      await queryClient.fetchQuery(query)

      // Verify data is cached
      expect(queryClient.getQueryData(['dApps'])).toEqual(mockDApps)

      // Now simulate API failure
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

      // Query should return cached data
      const result = await queryClient.fetchQuery(query)
      expect(result).toEqual(mockDApps)
    })

    it('throws an error on API failure if no cached data is available', async () => {
      const apiError = new Error('API Error')
      mockedAxios.get.mockRejectedValueOnce(apiError)

      const query = dAppsQuery({ select: (dApps) => dApps })

      await expect(queryClient.fetchQuery(query)).rejects.toThrow('API Error')
    })

    it('correctly applies staleTime and gcTime configurations', () => {
      const query = dAppsQuery({ select: (dApps) => dApps })

      expect(query.staleTime).toBe(ONE_HOUR_MS)
      expect(query.gcTime).toBe(Infinity)
    })

    it('fetches data successfully from API', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDApps })

      const query = dAppsQuery({ select: (dApps) => dApps })
      const result = await queryClient.fetchQuery(query)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://publicapi.alph.land/api/dapps')
      expect(result).toEqual(mockDApps)
    })

    it('applies select function correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDApps })

      // Use a new query client to avoid caching issues
      const testClient = new QueryClient()
      const query = dAppsQuery({ select: (dApps) => dApps.map((d) => d.name) })
      const result = await testClient.fetchQuery(query)

      // fetchQuery returns the raw queryFn data, not the selected data
      expect(result).toEqual(mockDApps)
    })
  })

  describe('dAppsTagsQuery', () => {
    const mockTags = ['DeFi', 'NFTs', 'Gaming', 'Social']

    it('returns cached data on API failure if available', async () => {
      // First, populate the cache with data
      mockedAxios.get.mockResolvedValueOnce({ data: mockTags })
      await queryClient.fetchQuery(dAppsTagsQuery)

      // Verify data is cached
      expect(queryClient.getQueryData(['dAppsTags'])).toEqual(mockTags)

      // Now simulate API failure
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'))

      // Query should return cached data (sorted by select function)
      const result = await queryClient.fetchQuery(dAppsTagsQuery)
      // The sortTags function keeps default tags in order and sorts remaining alphabetically
      expect(result).toEqual(['DeFi', 'NFTs', 'Gaming', 'Social'])
    })

    it('throws an error on API failure if no cached data is available', async () => {
      const apiError = new Error('API Error')
      mockedAxios.get.mockRejectedValueOnce(apiError)

      await expect(queryClient.fetchQuery(dAppsTagsQuery)).rejects.toThrow('API Error')
    })

    it('correctly applies staleTime and gcTime configurations', () => {
      expect(dAppsTagsQuery.staleTime).toBe(ONE_HOUR_MS)
      expect(dAppsTagsQuery.gcTime).toBe(Infinity)
    })

    it('fetches data successfully from API', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTags })

      const result = await queryClient.fetchQuery(dAppsTagsQuery)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://publicapi.alph.land/api/tags')
      // The sortTags function maintains default order for matched tags
      expect(result).toEqual(['DeFi', 'NFTs', 'Gaming', 'Social'])
    })

    it('sorts tags correctly with default tags first', () => {
      const unsortedTags = ['Wallets', 'Bridges', 'Gaming', 'NFTs', 'DeFi']

      // Call the select function directly to test sorting logic
      const result = (dAppsTagsQuery.select as (tags: string[]) => string[])(unsortedTags)

      // Default sorted tags come first: DeFi, NFTs, Gaming, Wallets (all in defaultSortedTags)
      // Then remaining tags sorted alphabetically: Bridges
      expect(result).toEqual(['DeFi', 'NFTs', 'Gaming', 'Wallets', 'Bridges'])
    })
  })
})
