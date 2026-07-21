const DB_NAME = 'NftImagesDB'
const STORE_NAME = 'images'
// Bumped when the cached value format changes so stale entries are dropped. v2 switched from full-res sources to
// downscaled webp thumbnails.
const DB_VERSION = 2

// One shared connection for the whole app. Opening (and never closing) a connection per operation leaks connections
// and, worse, a lingering old-version connection blocks a version upgrade from ever running.
let dbPromise: Promise<IDBDatabase> | null = null

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME)
      db.createObjectStore(STORE_NAME)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch((error) => {
    dbPromise = null // let a later call retry a failed open
    throw error
  })

  return dbPromise
}

const loadFromDB = async (url: string): Promise<Blob | null> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(url)

    request.onsuccess = () => resolve((request.result as Blob) ?? null)
    request.onerror = () => reject(request.error)
  })
}

const saveToDB = async (url: string, blob: Blob): Promise<void> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(blob, url)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// NFT sources are often multi-thousand-pixel images shown in ~150px grid tiles, which is expensive to decode and
// keep in memory at scale. We downscale once to this longest-side cap and cache the result: scrolling stays cheap and
// the on-disk cache stays small. The detail modal asks for the full-resolution image instead (see getNftImageBlob).
const MAX_THUMBNAIL_DIMENSION = 512

// Downscales an image blob to a small webp thumbnail. Any failure (unusual format, decode error, no OffscreenCanvas)
// resolves to the original blob so the image always displays, just uncompressed. Animated images collapse to their
// first frame, the same way video NFTs already become a static thumbnail.
const resizeImageBlob = async (blob: Blob): Promise<Blob> => {
  const bitmap = await createImageBitmap(blob)

  try {
    const largestSide = Math.max(bitmap.width, bitmap.height)
    if (largestSide <= MAX_THUMBNAIL_DIMENSION) return blob

    const scale = MAX_THUMBNAIL_DIMENSION / largestSide
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) return blob

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    return await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 })
  } finally {
    bitmap.close()
  }
}

// Dedupe concurrent requests for the same URL so that a tile rendered in several places (grid + modal) fetches once.
const inFlight = new Map<string, Promise<Blob>>()

// Fetches an NFT image once, persists its bytes in IndexedDB, and serves them from there on every later mount (across
// navigation and app restarts). This is what stops the NFTs tab from re-downloading every image each time it is opened.
// Rejects when the image cannot be fetched (e.g. a host without permissive CORS); callers fall back to the URL directly.
export const getNftImageBlob = (url: string, fullResolution = false): Promise<Blob> => {
  // The grid caches downscaled thumbnails; the detail modal asks for the full-resolution image, kept under a separate
  // key so it stays crisp on high-DPI screens.
  const cacheKey = fullResolution ? `full:${url}` : url

  const existing = inFlight.get(cacheKey)
  if (existing) return existing

  const promise = (async () => {
    const cached = await loadFromDB(cacheKey)
    if (cached) return cached

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch NFT image (${response.status})`)

    const sourceBlob = await response.blob()
    const blob = fullResolution ? sourceBlob : await resizeImageBlob(sourceBlob).catch(() => sourceBlob)
    // Caching is best-effort; a storage failure must not stop the image from displaying.
    void saveToDB(cacheKey, blob).catch(() => {})

    return blob
  })()

  inFlight.set(cacheKey, promise)
  promise.finally(() => inFlight.delete(cacheKey)).catch(() => {})

  return promise
}

export const deleteNftImagesDB = async () => {
  // Close the shared connection first, otherwise deleteDatabase is blocked by it, and reset so the next access reopens.
  const db = await dbPromise?.catch(() => null)
  db?.close()
  dbPromise = null
  indexedDB.deleteDatabase(DB_NAME)
}
