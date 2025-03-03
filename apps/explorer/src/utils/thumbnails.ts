const DB_NAME = 'VideoThumbnailsDB'
const STORE_NAME = 'thumbnails'

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      db.createObjectStore(STORE_NAME)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })

export const saveThumbnailToDB = async (videoUrl: string, blob: Blob): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    store.put(blob, videoUrl)

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

export const loadThumbnailFromDB = async (videoUrl: string): Promise<Blob | null> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(videoUrl)

    request.onsuccess = () => {
      resolve(request.result as Blob)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

const videoBlobCache: Record<string, Promise<Blob>> = {}

export const fetchVideoBlob = async (videoUrl: string): Promise<Blob> => {
  if (!videoBlobCache[videoUrl]) {
    videoBlobCache[videoUrl] = fetch(videoUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`)
        }
        return response.blob()
      })
      .catch((error) => {
        delete videoBlobCache[videoUrl]
        throw error
      })
  }

  return videoBlobCache[videoUrl]
}

export const createThumbnailFromVideoBlob = (blob: Blob): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(blob)
    video.src = url
    video.muted = true // Required for autoplay in some browsers
    video.crossOrigin = 'Anonymous'
    video.playsInline = true // Required for iOS to allow autoplay

    const handleLoadedData = () => {
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Invalid video dimensions'))
        return
      }

      const canvas = document.createElement('canvas')
      const scale = 0.5 // Reduce resolution by 50%
      canvas.width = video.videoWidth * scale
      canvas.height = video.videoHeight * scale
      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      const drawFrame = () => {
        setTimeout(() => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((thumbnailBlob) => {
            if (thumbnailBlob) {
              resolve(thumbnailBlob)
            } else {
              reject(new Error('Failed to create thumbnail blob'))
            }
            video.remove()
            URL.revokeObjectURL(url)
          })
        }, 100) // Adding a small delay to ensure the frame is ready (mobile)
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(drawFrame)
      })
    }

    video.addEventListener('loadeddata', () => {
      if (video.readyState >= 2) {
        handleLoadedData()
      } else {
        video.currentTime = 0 // Seek near the beginning
        video.addEventListener('seeked', handleLoadedData, { once: true })
      }
    })

    video.addEventListener('error', (e) => {
      reject(new Error(`Failed to load video: ${e.message}`))
    })

    video.play() // Force video play in case autoplay is blocked
  })

export const isValidThumbnail = (blob: Blob): boolean => blob.size > 17000 // Basic test. Approx size of blank thumbnail.

// We cache the thumbnails generation promises to avoid starting to generate new thumbnails when they are already being processed.
const thumbnailGenerationPromises: Record<string, Promise<Blob>> = {}
const thumbnailBlobCache: Record<string, Blob> = {}

export const getOrCreateThumbnail = async (videoUrl: string): Promise<Blob> => {
  const blob = thumbnailBlobCache[videoUrl]

  if (blob && isValidThumbnail(blob)) {
    return blob
  }

  if (!thumbnailGenerationPromises[videoUrl]) {
    thumbnailGenerationPromises[videoUrl] = fetchVideoBlob(videoUrl)
      .then((blob) => createThumbnailFromVideoBlob(blob))
      .then((thumbnailBlob) => {
        if (!isValidThumbnail(thumbnailBlob)) {
          throw new Error('Generated thumbnail is blank or invalid')
        }
        thumbnailBlobCache[videoUrl] = thumbnailBlob
        return thumbnailBlob
      })
      .catch((error) => {
        console.error('Error generating thumbnail:', error)
        delete thumbnailGenerationPromises[videoUrl]
        throw error
      })
  }

  return thumbnailGenerationPromises[videoUrl]
}
