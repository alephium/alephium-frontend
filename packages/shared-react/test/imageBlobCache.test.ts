import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createImageBlobCache } from '../src/images/imageBlobCache'

const URL_A = 'https://example.com/a.png'
const URL_B = 'https://example.com/b.png'

let dbCounter = 0

// Each cache gets its own database so tests cannot see each other's stored blobs.
const newCache = () => createImageBlobCache({ dbName: `TestImages-${dbCounter++}`, dbVersion: 1, maxDimension: 128 })

const mockFetch = (body = 'image-bytes') =>
  vi.fn(async () => new Response(new Blob([body], { type: 'image/png' }), { status: 200 }))

const failingFetch = (status: number) => vi.fn(async () => new Response('nope', { status }))

describe('createImageBlobCache', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches an image once and serves later calls from IndexedDB', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)
    const cache = newCache()

    const first = await cache.getImageBlob(URL_A)
    const second = await cache.getImageBlob(URL_A)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(await first.text()).toBe('image-bytes')
    expect(await second.text()).toBe('image-bytes')
  })

  it('serves a cached image to a freshly opened cache over the same database', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)
    const dbName = `TestImages-shared-${dbCounter++}`
    const config = { dbName, dbVersion: 1, maxDimension: 128 }

    await createImageBlobCache(config).getImageBlob(URL_A)
    await createImageBlobCache(config).getImageBlob(URL_A)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent requests for the same url', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)
    const cache = newCache()

    await Promise.all([cache.getImageBlob(URL_A), cache.getImageBlob(URL_A), cache.getImageBlob(URL_A)])

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('keeps the original-resolution copy under a separate key', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)
    const cache = newCache()

    await cache.getImageBlob(URL_A)
    await cache.getImageBlob(URL_A, { originalResolution: true })
    await cache.getImageBlob(URL_A, { originalResolution: true })

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('rejects on an error response and does not cache it', async () => {
    const fetchSpy = failingFetch(429)
    vi.stubGlobal('fetch', fetchSpy)
    const cache = newCache()

    await expect(cache.getImageBlob(URL_B)).rejects.toThrow('429')

    vi.stubGlobal('fetch', mockFetch('recovered'))
    expect(await (await cache.getImageBlob(URL_B)).text()).toBe('recovered')
  })

  it('stops serving cached blobs once the database is deleted', async () => {
    const fetchSpy = mockFetch()
    vi.stubGlobal('fetch', fetchSpy)
    const cache = newCache()

    await cache.getImageBlob(URL_A)
    await cache.deleteDatabase()
    await cache.getImageBlob(URL_A)

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
