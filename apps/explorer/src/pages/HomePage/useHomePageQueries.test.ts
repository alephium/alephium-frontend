import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, createElement, useEffect } from 'react'
import { createRoot, Root } from 'react-dom/client'

import client from '@/api/client'

import { useHomePageBlocks, useHomePageStatistics } from './useHomePageQueries'

vi.mock('@/api/client', () => ({
  default: {
    explorer: {
      infos: {
        getInfosHeights: vi.fn(async () => [{ value: 3 }, { value: 5 }]),
        getInfosAverageBlockTimes: vi.fn(async () => [{ value: 1000 }, { value: 3000 }]),
        getInfosSupplyTotalAlph: vi.fn(async () => '0'),
        getInfosSupplyCirculatingAlph: vi.fn(async () => '0'),
        getInfosTotalTransactions: vi.fn(async () => 0)
      },
      charts: {
        getChartsHashrates: vi.fn(async () => [{ timestamp: 1, hashrate: 7, value: 7 }]),
        getChartsTransactionsCount: vi.fn(async () => [{ timestamp: 1, totalCountAllChains: 9 }])
      },
      blocks: { getBlocks: vi.fn(async () => ({ blocks: [{ hash: 'a' }], total: 40 })) }
    }
  }
}))

let queryClient: QueryClient
let root: Root
let container: HTMLDivElement
let stats: ReturnType<typeof useHomePageStatistics>
let blocks: ReturnType<typeof useHomePageBlocks>
const now = Date.UTC(2026, 6, 15, 12, 0, 0)

interface ConsumerProps {
  visible: boolean
  page: number
  interval: 'daily' | 'hourly'
}
const Consumer = (props: ConsumerProps) => {
  const statistics = useHomePageStatistics(props.interval as never, props.visible)
  const blockData = useHomePageBlocks(props.page, props.visible)
  useEffect(() => {
    stats = statistics
    blocks = blockData
  })
  return null
}

// Avoid another test-only dependency: mount the actual hooks through React's DOM renderer.
const render = async (props = { visible: true, page: 1, interval: 'daily' as 'daily' | 'hourly' }, copies = 1) => {
  await act(async () => {
    root.render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        Array.from({ length: copies }, (_, key) => createElement(Consumer, { key, ...props }))
      )
    )
    await vi.advanceTimersByTimeAsync(1)
  })
  await advance(1)
}
const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.clearAllMocks()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 10000, gcTime: Infinity } } })
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount())
  queryClient.clear()
  container.remove()
  vi.useRealTimers()
})

it('deduplicates the initial mount and renders zero/empty values without endless skeletons', async () => {
  await render(undefined, 2)
  expect(client.explorer.infos.getInfosHeights).toHaveBeenCalledTimes(1)
  expect(client.explorer.blocks.getBlocks).toHaveBeenCalledTimes(1)
  expect(client.explorer.charts.getChartsHashrates).toHaveBeenCalledTimes(2)
  expect(stats.scalar.totalSupply).toMatchObject({ value: 0, isLoading: false, isError: false })
  expect(stats.scalar.totalBlocks.value).toBe(8)
  expect(stats.scalar.avgBlockTime.value).toBe(2000)
  expect(stats.vector.txVector.value).toEqual({ categories: [1], series: [9] })
})

it('polls cheap scalars at 10s and blocks at 5s, but charts only on the next minute', async () => {
  await render()
  await advance(10000)
  expect(client.explorer.infos.getInfosHeights).toHaveBeenCalledTimes(2)
  expect(client.explorer.blocks.getBlocks).toHaveBeenCalledTimes(3)
  expect(client.explorer.charts.getChartsHashrates).toHaveBeenCalledTimes(2)
  await advance(50000)
  await advance(1)
  expect(client.explorer.charts.getChartsHashrates).toHaveBeenCalledTimes(4)
  expect(client.explorer.charts.getChartsTransactionsCount).toHaveBeenCalledTimes(2)
  const query = vi.mocked(client.explorer.charts.getChartsTransactionsCount).mock.calls.at(-1)?.[0]
  expect(query?.toTs).toBe(now + 60000)
})

it('stops polling while hidden and resumes with the current bucket', async () => {
  await render({ visible: false, page: 1, interval: 'daily' })
  await advance(90000)
  expect(client.explorer.infos.getInfosHeights).not.toHaveBeenCalled()
  expect(client.explorer.charts.getChartsHashrates).not.toHaveBeenCalled()
  await render()
  expect(vi.mocked(client.explorer.charts.getChartsTransactionsCount).mock.calls.at(-1)?.[0].toTs).toBe(now + 60000)
})

it('does not poll older block pages and keys the interval toggle', async () => {
  await render({ visible: true, page: 2, interval: 'daily' })
  await advance(10000)
  expect(client.explorer.blocks.getBlocks).toHaveBeenCalledTimes(1)
  expect(client.explorer.blocks.getBlocks).toHaveBeenCalledWith(
    { page: 2, limit: 10 },
    { signal: expect.any(AbortSignal) }
  )
  await render({ visible: true, page: 2, interval: 'hourly' })
  expect(client.explorer.charts.getChartsTransactionsCount).toHaveBeenCalledTimes(2)
  expect(vi.mocked(client.explorer.charts.getChartsTransactionsCount).mock.calls.at(-1)?.[0]['interval-type']).toBe(
    'hourly'
  )
})

it('keeps the previous block page visible while the next page is fetching', async () => {
  await render()
  let resolve!: (value: never) => void
  vi.mocked(client.explorer.blocks.getBlocks).mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolve = r
      })
  )
  await render({ visible: true, page: 2, interval: 'daily' })
  expect(blocks.blockList?.blocks?.[0].hash).toBe('a')
  expect(blocks.blockPageLoading).toBe(false)
  await act(async () => {
    resolve({ blocks: [{ hash: 'b' }], total: 40 } as never)
  })
  await advance(1)
  expect(blocks.blockList?.blocks?.[0].hash).toBe('b')
  expect(blocks.newBlockHashes.size).toBe(0)
})

it('finishes loading on errors rather than leaving permanent skeletons', async () => {
  vi.mocked(client.explorer.infos.getInfosSupplyTotalAlph).mockRejectedValueOnce(new Error('offline'))
  await render()
  expect(stats.scalar.totalSupply).toEqual({ value: 0, isLoading: false, isError: true })
})

it('highlights newly arrived blocks on page one but not the initial baseline', async () => {
  await render()
  expect(blocks.newBlockHashes.size).toBe(0)
  vi.mocked(client.explorer.blocks.getBlocks).mockResolvedValueOnce({
    blocks: [{ hash: 'new' }, { hash: 'a' }],
    total: 41
  } as never)
  await advance(5001)
  expect([...blocks.newBlockHashes]).toEqual(['new'])
})

it('aborts a block request when its page is left', async () => {
  vi.mocked(client.explorer.blocks.getBlocks).mockImplementationOnce(() => new Promise(() => {}))
  await render()
  const signal = vi.mocked(client.explorer.blocks.getBlocks).mock.calls.at(-1)?.[1]?.signal
  await render({ visible: true, page: 2, interval: 'daily' })
  expect(signal?.aborted).toBe(true)
})
