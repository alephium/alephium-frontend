import { ONE_DAY_MS, ONE_SECOND_MS } from '@alephium/shared'
import { queryClient, queryClientConfig } from '@alephium/shared-react'

// shared-react's address queries are refreshed by invalidating this exact client, so the app must use it rather than
// build its own, otherwise those invalidations land on a cache nothing here observes.
queryClient.setDefaultOptions({
  ...queryClientConfig.defaultOptions,
  queries: {
    ...queryClientConfig.defaultOptions?.queries,
    staleTime: 10 * ONE_SECOND_MS,
    // gcTime must outlive the localStorage persister's maxAge (24h) or restored queries get evicted too early
    gcTime: ONE_DAY_MS,
    // Off so the header refreshes on the same tick as the tx list; focus-refetch would heal them out of step
    refetchOnWindowFocus: false
  }
})

export { queryClient }
