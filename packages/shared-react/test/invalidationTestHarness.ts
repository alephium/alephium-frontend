import { throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ALPH } from '@alephium/token-list'
import { ExplorerProvider, NodeProvider } from '@alephium/web3'
import { QueryObserver } from '@tanstack/react-query'
import { expect, vi } from 'vitest'

import {
  addressAlphBalancesQuery,
  addressBalancesByListingQuery,
  addressBalancesQuery,
  addressFtsQuery,
  addressTokensBalancesQuery,
  addressTokensByTypeQuery
} from '../src/api/queries/addressQueries'
import { addressLatestTransactionQuery, addressTransactionsCountQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'

export const ADDRESS_HASH: AddressHash = 'test-address'

// Devnet resolves the token list locally, keeping the mocked network surface minimal
export const NETWORK_ID = 4

const addressProps = { addressHash: ADDRESS_HASH, networkId: NETWORK_ID, isNodeOnline: true }
const explorerProps = { addressHash: ADDRESS_HASH, networkId: NETWORK_ID, isExplorerOnline: true }

export const gateQuery = () => addressLatestTransactionQuery(explorerProps)
export const alphBalanceQuery = () => addressAlphBalancesQuery(addressProps)
export const tokensBalanceQuery = () => addressTokensBalancesQuery(addressProps)
export const txCountQuery = () => addressTransactionsCountQuery(explorerProps)
export const balancesAllQuery = () => addressBalancesQuery(addressProps)
export const balancesByListingQuery = () => addressBalancesByListingQuery(addressProps)
export const tokensByTypeQuery = () => addressTokensByTypeQuery(addressProps)
export const ftsQuery = () => addressFtsQuery(addressProps)

interface ConfirmedTx {
  hash: string
  blockHash: string
  timestamp: number
  inputs: never[]
  outputs: never[]
}

export const confirmedTx = (hash: string): ConfirmedTx => ({
  hash,
  blockHash: `block-of-${hash}`,
  timestamp: 1,
  inputs: [],
  outputs: []
})

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

export const installMockExplorer = () => {
  const state = {
    latestTxHash: 'tx-1',
    alphBalance: { balance: '1000', lockedBalance: '0' },
    totalTransactions: 1,
    transactionsByPage: { 1: [confirmedTx('tx-1')] } as Record<number, ConfirmedTx[]>
  }

  const mocks = {
    latestTx: vi.fn(async () => {
      await tick()
      return { hash: state.latestTxHash, timestamp: 1 }
    }),
    alphBalance: vi.fn(async () => {
      await tick()
      return { ...state.alphBalance }
    }),
    tokensBalance: vi.fn(async () => {
      await tick()
      return []
    }),
    txCount: vi.fn(async () => {
      await tick()
      return state.totalTransactions
    }),
    transactions: vi.fn(async (_addressHash: string, { page }: { page: number }) => {
      await tick()
      return state.transactionsByPage[page] ?? []
    })
  }

  const explorer = {
    addresses: {
      getAddressesAddressLatestTransaction: mocks.latestTx,
      getAddressesAddressBalance: mocks.alphBalance,
      getAddressesAddressTokensBalance: mocks.tokensBalance,
      getAddressesAddressTotalTransactions: mocks.txCount,
      getAddressesAddressTransactions: mocks.transactions
    }
  }

  const node = {
    addresses: {
      getAddressesAddressBalance: vi.fn(async () => {
        throw new Error('The node fallback endpoint should not be reached in these tests')
      })
    }
  }

  vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue(explorer as unknown as ExplorerProvider)
  vi.spyOn(throttledClient, 'node', 'get').mockReturnValue(node as unknown as NodeProvider)

  return { state, mocks }
}

export type MockExplorer = ReturnType<typeof installMockExplorer>

const subscriptions: Array<() => void> = []

// Mirrors useQuery mounting: a subscribed QueryObserver makes the query active
export const observe = <TOptions extends { queryKey: readonly unknown[] }>(options: TOptions) => {
  const observer = new QueryObserver(queryClient, queryClient.defaultQueryOptions(options as never))

  subscriptions.push(observer.subscribe(() => {}))

  return observer
}

export const trackSubscription = (unsubscribe: () => void) => {
  subscriptions.push(unsubscribe)
}

export const cleanUpQueryClient = async () => {
  subscriptions.splice(0).forEach((unsubscribe) => unsubscribe())
  await queryClient.cancelQueries()
  queryClient.clear()
}

export const getState = ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const state = queryClient.getQueryState(queryKey as unknown[])

  expect(state).toBeDefined()

  return state as NonNullable<typeof state>
}

// Counts 'fetch' dispatches per query, i.e. actual queryFn executions started (deduplicated calls don't dispatch)
export const trackFetchStarts = () => {
  const counts = new Map<string, number>()

  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.action.type === 'fetch') {
      counts.set(event.query.queryHash, (counts.get(event.query.queryHash) ?? 0) + 1)
    }
  })

  trackSubscription(unsubscribe)

  return {
    of: ({ queryKey }: { queryKey: readonly unknown[] }) => {
      const query = queryClient.getQueryCache().find({ queryKey: queryKey as unknown[] })

      return query ? counts.get(query.queryHash) ?? 0 : 0
    }
  }
}

// The gate skips the cascade on its very first data (cold cache), making it a safe way to seed its cache
export const seedGate = async () => {
  await queryClient.fetchQuery(gateQuery())
}

// Creates cache entries bottom-up: dependencies enter the query cache before the queries that consume them
export const seedDependenciesFirst = async () => {
  await queryClient.fetchQuery(alphBalanceQuery())
  await queryClient.fetchQuery(tokensBalanceQuery())
  await queryClient.fetchQuery(txCountQuery())
  await queryClient.fetchQuery(balancesAllQuery())
  await queryClient.fetchQuery(balancesByListingQuery())
  await queryClient.fetchQuery(tokensByTypeQuery())
  await queryClient.fetchQuery(ftsQuery())
}

// Creates cache entries top-down, the natural order when only derived hooks mount: each queryFn lazily creates its
// dependencies via fetchQuery, so consumers enter the query cache before their dependencies
export const seedConsumersFirst = async (topLevelOptions: { queryKey: readonly unknown[] } = ftsQuery()) => {
  await queryClient.fetchQuery(topLevelOptions as never)
}

export const detectNewTxThroughGate = async (mockExplorer: MockExplorer, newTxHash: string) => {
  mockExplorer.state.latestTxHash = newTxHash

  await queryClient.refetchQueries({ queryKey: gateQuery().queryKey })
}

export const bumpServerBalance = (mockExplorer: MockExplorer, balance: string) => {
  mockExplorer.state.alphBalance = { balance, lockedBalance: '0' }
}

export const getAlphL0BalanceMarker = (data: unknown): string | undefined =>
  (data as { balances?: { totalBalance: string } })?.balances?.totalBalance

export const getAlphTotalBalanceMarker = (data: unknown): string | undefined => {
  const balances = (data as { balances?: Array<{ id: string; totalBalance: string }> })?.balances

  return Array.isArray(balances) ? balances.find(({ id }) => id === ALPH.id)?.totalBalance : undefined
}

export const getListedFtsMarker = (data: unknown): string | undefined =>
  (data as { listedFts?: Array<{ id: string; totalBalance: string }> })?.listedFts?.find(({ id }) => id === ALPH.id)
    ?.totalBalance
