import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchContentType, FetchError, fetchJson, postJson } from '../src/api/fetchUtils'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

const jsonResponse = (data: unknown, status = 200, statusText = 'OK') => ({
  ok: status >= 200 && status < 300,
  status,
  statusText,
  json: () => Promise.resolve(data),
  headers: new Headers()
})

describe('FetchError', () => {
  it('has correct name, message, status, and url', () => {
    const error = new FetchError('Not Found', 404, 'https://example.com/missing')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('FetchError')
    expect(error.message).toBe('Not Found')
    expect(error.status).toBe(404)
    expect(error.url).toBe('https://example.com/missing')
  })
})

describe('fetchJson', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1, name: 'test' }))

    const result = await fetchJson('https://api.example.com/data')

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data')
    expect(result).toEqual({ id: 1, name: 'test' })
  })

  it('throws FetchError on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(null, 404, 'Not Found'))

    await expect(fetchJson('https://api.example.com/missing')).rejects.toThrow(FetchError)

    try {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 429, 'Too Many Requests'))
      await fetchJson('https://api.example.com/rate-limited')
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError)
      expect((e as FetchError).status).toBe(429)
      expect((e as FetchError).url).toBe('https://api.example.com/rate-limited')
      expect((e as FetchError).message).toBe('Too Many Requests')
    }
  })

  it('supports generic type parameter', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ price: 1.5 }))

    const result = await fetchJson<{ price: number }>('https://api.example.com/price')

    expect(result.price).toBe(1.5)
  })
})

describe('postJson', () => {
  it('sends POST with JSON body and returns parsed response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }))

    const result = await postJson('https://api.example.com/submit', { key: 'value' })

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' })
    })
    expect(result).toEqual({ success: true })
  })

  it('throws FetchError on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(null, 500, 'Internal Server Error'))

    await expect(postJson('https://api.example.com/submit', {})).rejects.toThrow(FetchError)
  })
})

describe('fetchContentType', () => {
  it('extracts MIME type from data: URI with semicolon (base64)', async () => {
    const result = await fetchContentType('data:image/svg+xml;base64,PHN2Zy...')

    expect(result).toBe('image/svg+xml')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('extracts MIME type from data: URI with comma only', async () => {
    const result = await fetchContentType('data:application/json,{"name":"test"}')

    expect(result).toBe('application/json')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('extracts MIME type from data: URI with charset parameter', async () => {
    const result = await fetchContentType('data:application/json;utf8,{"name":"test"}')

    expect(result).toBe('application/json')
  })

  it('sends HEAD request for HTTP URLs', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: new Headers({ 'content-type': 'image/png' })
    })

    const result = await fetchContentType('https://example.com/image.png')

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.png', { method: 'HEAD' })
    expect(result).toBe('image/png')
  })

  it('returns empty string when content-type header is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: new Headers()
    })

    const result = await fetchContentType('https://example.com/unknown')

    expect(result).toBe('')
  })
})
