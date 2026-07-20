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

  const inferredContentType = inferContentTypeFromExtension(url)

  if (inferredContentType) return inferredContentType

  const res = await fetch(url, { method: 'HEAD' })

  return res.headers.get('content-type') || ''
}

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  apng: 'image/apng',
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  ogv: 'video/ogg',
  webm: 'video/webm',
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  oga: 'audio/ogg',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  wav: 'audio/wav'
}

const inferContentTypeFromExtension = (url: string): string | undefined => {
  try {
    const extension = new URL(url).pathname.split('.').pop()?.toLowerCase()

    return extension ? MIME_TYPE_BY_EXTENSION[extension] : undefined
  } catch {
    return undefined
  }
}
