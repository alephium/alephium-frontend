export class FetchError extends Error {
  status: number
  url: string

  constructor(message: string, status: number, url: string) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.url = url
  }
}

export const fetchJson = async <T = unknown>(url: string): Promise<T> => {
  const res = await fetch(url)

  if (!res.ok) throw new FetchError(res.statusText, res.status, url)

  return res.json()
}

export const postJson = async <T = unknown>(url: string, body: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) throw new FetchError(res.statusText, res.status, url)

  return res.json()
}

export const fetchContentType = async (url: string): Promise<string> => {
  if (url.startsWith('data:')) {
    const semicolonIndex = url.indexOf(';')
    const commaIndex = url.indexOf(',')
    const mimeEnd = semicolonIndex !== -1 ? Math.min(semicolonIndex, commaIndex) : commaIndex

    return url.slice(5, mimeEnd)
  }

  const res = await fetch(url, { method: 'HEAD' })

  return res.headers.get('content-type') || ''
}
