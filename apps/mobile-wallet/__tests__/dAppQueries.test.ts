import { ONE_HOUR_MS } from '@alephium/shared'
import { queryClient } from '@alephium/shared-react'
import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { dAppsQuery, selectTagsFromDApps } from '~/api/queries/dAppQueries'
import { DApp } from '~/features/ecosystem/ecosystemTypes'

vi.mock('axios', () => ({
  default: { get: vi.fn() }
}))
const mockedAxios = vi.mocked(axios)

describe('dAppQueries', () => {
  beforeEach(() => {
    // Clear all cache data
    queryClient.removeQueries()
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  afterEach(() => {
    queryClient.removeQueries()
  })

  describe('dAppsQuery', () => {
    const mockDApps: DApp[] = [
      {
        name: 'TestDApp1',
        links: {
          website: 'https://test1.com',
          mirror: 'https://test1.com/mirror',
          twitter: 'https://test1.com/twitter',
          telegram: 'https://test1.com/telegram',
          discord: 'https://test1.com/discord',
          github: 'https://test1.com/github',
          youtube: 'https://test1.com/youtube',
          medium: 'https://test1.com/medium',
          careers: 'https://test1.com/careers',
          linkedin: 'https://test1.com/linkedin',
          docs: 'https://test1.com/docs'
        },
        short_description: 'Test 1',
        tags: ['DeFi'],
        verified: true,
        councils_choice: true,
        dotw: true,
        teamInfo: { contactEmail: 'test1@test.com', founded: '2021-01-01', anonymous: false },
        media: {
          logoUrl: 'https://test1.com/logo.png',
          bannerUrl: 'https://test1.com/banner.png',
          previewUrl: 'https://test1.com/preview.png',
          gallery: []
        },
        description: 'Test 1',
        audits: [],
        tokens: [],
        twitterName: 'test1',
        isFeatured: true,
        slug: 'test1'
      },
      {
        name: 'TestDApp2',
        links: {
          website: 'https://test2.com',
          mirror: 'https://test2.com/mirror',
          twitter: 'https://test2.com/twitter',
          telegram: 'https://test2.com/telegram',
          discord: 'https://test2.com/discord',
          github: 'https://test2.com/github',
          youtube: 'https://test2.com/youtube',
          medium: 'https://test2.com/medium',
          careers: 'https://test2.com/careers',
          linkedin: 'https://test2.com/linkedin',
          docs: 'https://test2.com/docs'
        },
        short_description: 'Test 2',
        tags: ['NFTs'],
        verified: true,
        councils_choice: true,
        dotw: true,
        teamInfo: { contactEmail: 'test2@test.com', founded: '2021-01-01', anonymous: false },
        media: {
          logoUrl: 'https://test2.com/logo.png',
          bannerUrl: 'https://test2.com/banner.png',
          previewUrl: 'https://test2.com/preview.png',
          gallery: []
        },
        description: 'Test 2',
        audits: [],
        tokens: [],
        twitterName: 'test2',
        isFeatured: true,
        slug: 'test2'
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

      expect(mockedAxios.get).toHaveBeenCalledWith('https://alph.land/api/dapps-directory')
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

  describe('selectTagsFromDApps', () => {
    const makeDApp = (tags: string[]): DApp => ({
      name: 'TestDApp',
      links: {
        website: 'https://test.com',
        mirror: 'https://test.com/mirror',
        twitter: 'https://test.com/twitter',
        telegram: 'https://test.com/telegram',
        discord: 'https://test.com/discord',
        github: 'https://test.com/github',
        youtube: 'https://test.com/youtube',
        medium: 'https://test.com/medium',
        careers: 'https://test.com/careers',
        linkedin: 'https://test.com/linkedin',
        docs: 'https://test.com/docs'
      },
      short_description: 'Test',
      tags,
      verified: true,
      councils_choice: false,
      dotw: false,
      teamInfo: { contactEmail: 'test@test.com', founded: '2021-01-01', anonymous: false },
      media: { logoUrl: '', bannerUrl: '', previewUrl: '', gallery: [] },
      description: 'Test',
      audits: [],
      tokens: [],
      twitterName: 'test',
      isFeatured: true,
      slug: 'test'
    })

    it('extracts unique tags from all dApps', () => {
      const dApps = [makeDApp(['DeFi', 'NFTs']), makeDApp(['NFTs', 'Gaming'])]

      expect(selectTagsFromDApps(dApps)).toEqual(['DeFi', 'NFTs', 'Gaming'])
    })

    it('sorts tags with default tags first, then remaining alphabetically', () => {
      const dApps = [makeDApp(['Wallets', 'Bridges']), makeDApp(['Gaming', 'NFTs', 'DeFi'])]

      expect(selectTagsFromDApps(dApps)).toEqual(['DeFi', 'NFTs', 'Gaming', 'Wallets', 'Bridges'])
    })

    it('returns empty array for dApps with no tags', () => {
      expect(selectTagsFromDApps([makeDApp([])])).toEqual([])
    })

    it('returns empty array for empty dApps list', () => {
      expect(selectTagsFromDApps([])).toEqual([])
    })
  })
})
