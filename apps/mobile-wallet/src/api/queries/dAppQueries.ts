import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { DApp } from '~/features/ecosystem/ecosystemTypes'

interface DAppsQueryOptions<T> {
  select: (dApps: DApp[]) => T
}

export const dAppsQuery = <T>({ select }: DAppsQueryOptions<T>) =>
  queryOptions({
    queryKey: ['dApps'],
    queryFn: () => axios.get('https://publicapi.alph.land/api/dapps').then((res) => res.data),
    select
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

export const dAppsTagsQuery = queryOptions({
  queryKey: ['dAppsTags'],
  queryFn: () => axios.get('https://publicapi.alph.land/api/tags').then((res) => res.data as string[]),
  select: sortTags
})
