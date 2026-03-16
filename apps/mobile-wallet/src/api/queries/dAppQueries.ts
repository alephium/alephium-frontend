import { ONE_HOUR_MS } from '@alephium/shared'
import { getQueryConfig, queryClient } from '@alephium/shared-react'
import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

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
      axios
        .get('https://alph.land/api/dapps-directory')
        .then((res) => res.data)
        .catch((e) => {
          const cachedDApps = queryClient.getQueryData(queryKey)

          if (cachedDApps) {
            return cachedDApps
          } else {
            throw e
          }
        }),
    select: (data) => select(onlyWhitelisted ? data.filter((dApp) => dApp.isFeatured) : data)
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
