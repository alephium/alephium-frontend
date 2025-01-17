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
