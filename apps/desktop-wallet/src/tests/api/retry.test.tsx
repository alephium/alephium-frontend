import { explorer as e } from '@alephium/web3'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http } from 'msw'
import { ReactNode } from 'react'

import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { queryClientConfig } from '@/api/queryClient'
import { server } from '@/tests/api/setup'

const TEST_TIMEOUT = 60 * 1000

describe('retry', () => {
  it('Should not retry when successfully receiving a response', async () => {
    // Mock explorer backend response with successful response
    server.use(
      http.get(
        '*/addresses/*/balance',
        () =>
          new Response(
            JSON.stringify({
              balance: '10',
              lockedBalance: '0'
            } as e.AddressBalance)
          )
      )
    )

    const result = renderBalancesHookWithQueryClient()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.balances.totalBalance).toEqual('10')
    expect(result.current.data?.balances.availableBalance).toEqual('10')
    expect(result.current.data?.balances.lockedBalance).toEqual('0')
  })

  it('Should not retry when receiving an error response other than 429', async () => {
    // Mock explorer backend response with error response
    server.use(http.get('*/addresses/*/balance', () => new Response(null, { status: 500 })))

    const result = renderBalancesHookWithQueryClient()

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it(
    'Should retry max 3 times when receiving a 429 response',
    async () => {
      // Mock explorer backend response with 429 response
      server.use(http.get('*/addresses/*/balance', () => new Response(null, { status: 429 })))

      const result = renderBalancesHookWithQueryClient()

      // First try
      await waitFor(() => expect(result.current.failureCount).toBe(1), { timeout: TEST_TIMEOUT })
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isError).toBe(false)

      // Second try
      await waitFor(() => expect(result.current.failureCount).toBe(2), { timeout: TEST_TIMEOUT })
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isError).toBe(false)

      // Third try
      await waitFor(() => expect(result.current.failureCount).toBe(3), { timeout: TEST_TIMEOUT })
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isError).toBe(false)

      // After the third try the query should be in error state and stop loading
      await waitFor(() => expect(result.current.isError).toBe(true), { timeout: TEST_TIMEOUT })
      expect(result.current.isLoading).toBe(false)
    },
    TEST_TIMEOUT
  )
})

const renderBalancesHookWithQueryClient = () => {
  const queryClient = new QueryClient(queryClientConfig)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const { result } = renderHook(
    () =>
      useQuery(
        addressAlphBalancesQuery({ addressHash: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH', networkId: 0 })
      ),
    { wrapper }
  )

  return result
}
