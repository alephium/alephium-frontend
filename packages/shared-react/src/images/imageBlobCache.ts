interface ImageBlobCacheConfig {
  dbName: string
  dbVersion: number
  maxDimension: number
}

interface GetImageBlobOptions {
  originalResolution?: boolean
}

const STORE_NAME = 'images'

export const createImageBlobCache = ({ dbName, dbVersion, maxDimension }: ImageBlobCacheConfig) => {
  // One shared connection for the whole app. Opening (and never closing) a connection per operation leaks connections
  // and, worse, a lingering old-version connection blocks a version upgrade from ever running.
  let dbPromise: Promise<IDBDatabase> | null = null

  const openDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion)

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

  const loadFromDB = async (key: string): Promise<Blob | null> => {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)

      request.onsuccess = () => resolve((request.result as Blob) ?? null)
      request.onerror = () => reject(request.error)
    })
  }

  const saveToDB = async (key: string, blob: Blob): Promise<void> => {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(blob, key)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // Animated images collapse to their first frame, and vector sources without intrinsic dimensions throw in
  // createImageBitmap - callers get the original blob back in both cases, so the image always displays.
  const resizeImageBlob = async (blob: Blob): Promise<Blob> => {
    const bitmap = await createImageBitmap(blob)

    try {
      const largestSide = Math.max(bitmap.width, bitmap.height)
      if (largestSide <= maxDimension) return blob

      const scale = maxDimension / largestSide
      const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) return blob

      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      return await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 })
    } finally {
      bitmap.close()
    }
  }

  // Dedupe concurrent requests for the same key so an image rendered in several places fetches once.
  const inFlight = new Map<string, Promise<Blob>>()

  // Rejects when the image cannot be fetched (e.g. a host without permissive CORS, or an HTTP error); callers fall
  // back to the URL directly.
  const getImageBlob = (url: string, { originalResolution = false }: GetImageBlobOptions = {}): Promise<Blob> => {
    const cacheKey = originalResolution ? `full:${url}` : url

    const existing = inFlight.get(cacheKey)
    if (existing) return existing

    const promise = (async () => {
      const cached = await loadFromDB(cacheKey)
      if (cached) return cached

      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch image (${response.status})`)

      const sourceBlob = await response.blob()
      const blob = originalResolution ? sourceBlob : await resizeImageBlob(sourceBlob).catch(() => sourceBlob)
      // Caching is best-effort; a storage failure must not stop the image from displaying.
      void saveToDB(cacheKey, blob).catch(() => {})

      return blob
    })()

    inFlight.set(cacheKey, promise)
    promise.finally(() => inFlight.delete(cacheKey)).catch(() => {})

    return promise
  }

  const deleteDatabase = async () => {
    // Close the shared connection first, otherwise deleteDatabase is blocked by it, and reset so the next access
    // reopens.
    const db = await dbPromise?.catch(() => null)
    db?.close()
    dbPromise = null
    indexedDB.deleteDatabase(dbName)
  }

  return { getImageBlob, deleteDatabase }
}
