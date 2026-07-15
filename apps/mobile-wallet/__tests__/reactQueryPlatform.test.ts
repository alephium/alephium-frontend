import '~/api/reactQueryPlatform'

import { FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL, ONE_MINUTE_MS } from '@alephium/shared'
import { throttledClient } from '@alephium/shared/api'
import { addressLatestTransactionQuery, queryClientConfig } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { focusManager, onlineManager, QueryClient, QueryObserver } from '@tanstack/react-query'
import { AppState, AppStateStatus } from 'react-native'

// React Native defines a global `window` (react-native/Libraries/Core/setUpGlobals.js). Without it, React Query
// considers itself to be running on a server and never schedules refetch intervals, which would make the polling
// assertions below vacuous.
const { netInfoListeners } = vi.hoisted(() => {
  globalThis.window = globalThis as unknown as Window & typeof globalThis

  return { netInfoListeners: [] as Array<(state: { isConnected: boolean | null }) => void> }
})

vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: (listener: (state: { isConnected: boolean | null }) => void) => {
      netInfoListeners.push(listener)

      return () => netInfoListeners.splice(netInfoListeners.indexOf(listener), 1)
    }
  }
}))

vi.mock('@alephium/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@alephium/shared/api')>()),
  throttledClient: {
    explorer: {
      addresses: {
        getAddressesAddressLatestTransaction: vi.fn()
      }
    }
  }
}))

const ADDRESS_HASH = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'

const fetchLatestTransaction = vi.mocked(throttledClient.explorer.addresses.getAddressesAddressLatestTransaction)

const emitAppStateChange = (status: AppStateStatus) => {
  const calls = vi.mocked(AppState.addEventListener).mock.calls as unknown as Array<
    [string, (status: AppStateStatus) => void]
  >

  calls.filter(([event]) => event === 'change').forEach(([, handler]) => handler(status))
}

const emitConnectivityChange = (isConnected: boolean) =>
  netInfoListeners.forEach((listener) => listener({ isConnected }))

// Mirrors what useAddressesDataPolling mounts: the latest transaction query of an address, optionally polled
const withMountedObserver = async (refetchInterval: number | undefined, assert: () => Promise<void>) => {
  vi.useFakeTimers()

  const queryClient = new QueryClient(queryClientConfig)
  queryClient.mount()

  const observer = new QueryObserver(queryClient, {
    ...addressLatestTransactionQuery({ addressHash: ADDRESS_HASH, networkId: 0, isExplorerOnline: true }),
    refetchInterval,
    notifyOnChangeProps: []
  })
  const unsubscribe = observer.subscribe(() => null)

  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchLatestTransaction).toHaveBeenCalledTimes(1)

    await assert()
  } finally {
    unsubscribe()
    queryClient.unmount()
    queryClient.clear()
    vi.useRealTimers()
  }
}

describe('reactQueryPlatform', () => {
  beforeEach(() => {
    focusManager.setFocused(true)
    onlineManager.setOnline(true)
    fetchLatestTransaction.mockReset()
    fetchLatestTransaction.mockResolvedValue({ hash: 'tx-hash', timestamp: 0 } as e.Transaction)
  })

  describe('focusManager', () => {
    it('reports the app as unfocused when it goes to the background', () => {
      emitAppStateChange('background')

      expect(focusManager.isFocused()).toBe(false)
    })

    it('reports the app as focused when it returns to the foreground', () => {
      emitAppStateChange('background')
      emitAppStateChange('active')

      expect(focusManager.isFocused()).toBe(true)
    })
  })

  describe('onlineManager', () => {
    it('reports the app as offline when the device loses connectivity', () => {
      emitConnectivityChange(false)

      expect(onlineManager.isOnline()).toBe(false)
    })

    it('reports the app as online when the device regains connectivity', () => {
      emitConnectivityChange(false)
      emitConnectivityChange(true)

      expect(onlineManager.isOnline()).toBe(true)
    })
  })

  describe('refetch policy', () => {
    it('is set explicitly instead of being inherited from the browser defaults', () => {
      expect(queryClientConfig.defaultOptions?.queries?.refetchOnWindowFocus).toBe(true)
      expect(queryClientConfig.defaultOptions?.queries?.refetchOnReconnect).toBe(true)
    })

    it('suspends the address polling while the app is in the background', async () => {
      await withMountedObserver(FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL, async () => {
        await vi.advanceTimersByTimeAsync(FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL)
        expect(fetchLatestTransaction).toHaveBeenCalledTimes(2)

        emitAppStateChange('background')
        await vi.advanceTimersByTimeAsync(3 * FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL)
        expect(fetchLatestTransaction).toHaveBeenCalledTimes(2)
      })
    })

    it('refetches the stale latest transaction query when the app returns to the foreground', async () => {
      await withMountedObserver(undefined, async () => {
        emitAppStateChange('background')
        await vi.advanceTimersByTimeAsync(ONE_MINUTE_MS + 1)

        emitAppStateChange('active')
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchLatestTransaction).toHaveBeenCalledTimes(2)
      })
    })

    it('does not refetch on foreground while the latest transaction query is still fresh', async () => {
      await withMountedObserver(undefined, async () => {
        emitAppStateChange('background')
        await vi.advanceTimersByTimeAsync(ONE_MINUTE_MS / 2)

        emitAppStateChange('active')
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchLatestTransaction).toHaveBeenCalledTimes(1)
      })
    })

    it('refetches the stale latest transaction query when the device regains connectivity', async () => {
      await withMountedObserver(undefined, async () => {
        await vi.advanceTimersByTimeAsync(ONE_MINUTE_MS + 1)

        emitConnectivityChange(false)
        emitConnectivityChange(true)
        await vi.advanceTimersByTimeAsync(0)
        expect(fetchLatestTransaction).toHaveBeenCalledTimes(2)
      })
    })
  })
})
