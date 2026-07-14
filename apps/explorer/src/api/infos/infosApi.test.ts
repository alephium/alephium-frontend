import { explorer } from '@alephium/web3'
import { QueryClient, QueryObserver } from '@tanstack/react-query'

import { infosQueries } from '@/api/infos/infosApi'
import { computeConfirmations } from '@/utils/confirmations'

const { getInfosHeights } = vi.hoisted(() => ({ getInfosHeights: vi.fn() }))

vi.mock('@/api/client', () => ({
  default: { explorer: { infos: { getInfosHeights } } }
}))

const txBlock: explorer.BlockEntryLite = {
  hash: '0000000000000000000000000000000000000000000000000000000000000001',
  timestamp: 1784035982281,
  chainFrom: 0,
  chainTo: 1,
  height: 100,
  txNumber: 1,
  mainChain: true,
  hashRate: '5175173459918688'
}

const mockAdvancingChainTip = (startingHeight: number) => {
  let height = startingHeight - 1

  getInfosHeights.mockImplementation(() => {
    height += 1
    return Promise.resolve([{ chainFrom: 0, chainTo: 1, height, value: height }])
  })
}

const observeHeights = (isAppVisible: boolean) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const observer = new QueryObserver(queryClient, infosQueries.all.heights(isAppVisible))
  const unsubscribe = observer.subscribe(() => undefined)

  return {
    getChainHeights: () => observer.getCurrentResult().data as explorer.PerChainHeight[] | undefined,
    stop: () => {
      unsubscribe()
      queryClient.clear()
    }
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  getInfosHeights.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

it('keeps refetching the chain heights while the page is visible', async () => {
  mockAdvancingChainTip(100)

  const { stop } = observeHeights(true)

  await vi.advanceTimersByTimeAsync(60000)
  stop()

  expect(getInfosHeights.mock.calls.length).toBeGreaterThan(1)
})

it('stops refetching the chain heights while the page is hidden', async () => {
  mockAdvancingChainTip(100)

  const { stop } = observeHeights(false)

  await vi.advanceTimersByTimeAsync(60000)
  stop()

  expect(getInfosHeights).toHaveBeenCalledTimes(1)
})

it('makes the confirmations of a confirmed tx tick up without a page reload', async () => {
  mockAdvancingChainTip(txBlock.height)

  const { getChainHeights, stop } = observeHeights(true)

  await vi.advanceTimersByTimeAsync(0)
  const confirmationsOnLoad = computeConfirmations(txBlock, getChainHeights()?.[0])

  await vi.advanceTimersByTimeAsync(30000)
  const confirmationsLater = computeConfirmations(txBlock, getChainHeights()?.[0])

  stop()

  expect(confirmationsOnLoad).toEqual(1)
  expect(confirmationsLater).toBeGreaterThan(confirmationsOnLoad)
})
