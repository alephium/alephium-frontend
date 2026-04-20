import { ONE_HOUR_MS } from '@alephium/shared'
import { fetchJson, getQueryConfig, queryClient } from '@alephium/shared-react'
import { dapps } from '@alphland/dapps'
import { queryOptions } from '@tanstack/react-query'

import { DApp } from '~/features/ecosystem/ecosystemTypes'

interface DAppsQueryOptions<T> {
  select: (dApps: DApp[]) => T
  onlyWhitelisted?: boolean
}

export const dAppsQuery = <T>({ select, onlyWhitelisted }: DAppsQueryOptions<T>) =>
  queryOptions({
    queryKey: ['dApps'],
    ...getQueryConfig({ staleTime: ONE_HOUR_MS, gcTime: Infinity, networkId: 0 }),
    queryFn: ({ queryKey }): Promise<DApp[]> =>
      fetchJson<DApp[]>('https://alph.land/api/dapps-directory').catch((e) => {
        const cachedDApps = queryClient.getQueryData<DApp[]>(queryKey)

        if (cachedDApps) {
          return cachedDApps
        } else {
          throw e
        }
      }),
    placeholderData: dapps,
    select: (data) => {
      const dAppsList = onlyWhitelisted
        ? data.filter((dApp) => dApp.isFeatured)
        : data.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))

      return select(dAppsList)
    }
  })

export const dAppQuery = (dAppName: string) => ({
  ...dAppsQuery({ select: (dApps) => dApps.find((dApp) => dApp.name === dAppName) })
})

// If these tags are found in the API results, move them to the front
const defaultSortedTags = ['DeFi', 'NFTs', 'Gaming', 'Social', 'Onramps', 'Wallets']

const sortTags = (tags: string[]) => [
  ...defaultSortedTags.filter((tag) => tags.includes(tag)),
  ...tags.filter((tag) => !defaultSortedTags.includes(tag)).sort()
]

export const selectTagsFromDApps = (dApps: DApp[]) => sortTags([...new Set(dApps.flatMap((dApp) => dApp.tags || []))])
