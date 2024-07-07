/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
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

const videoBlobCache: Record<string, Promise<Blob> | undefined> = {}
const thumbnailGenerationPromises: Record<string, Promise<Blob> | undefined> = {}
const thumbnailBlobCache: Record<string, Blob | undefined> = {}

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

  return videoBlobCache[videoUrl]!
}

export const createThumbnailFromVideoBlob = (blob: Blob): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(blob)
    video.src = url
    video.muted = true // Required for autoplay in some browsers
    video.crossOrigin = 'Anonymous'

    console.log('Video created and URL set:', url)

    const handleLoadedData = () => {
      console.log('handleLoadedData called')
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Invalid video dimensions'))
        return
      }

      const canvas = document.createElement('canvas')
      const scale = 0.5 // Reduce resolution by 50%
      canvas.width = video.videoWidth * scale
      canvas.height = video.videoHeight * scale
      const context = canvas.getContext('2d')

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((thumbnailBlob) => {
          console.log('Canvas to blob completed', thumbnailBlob)
          if (thumbnailBlob) {
            resolve(thumbnailBlob)
          } else {
            reject(new Error('Failed to create thumbnail blob'))
          }
          // Clean up the video element and URL
          video.remove()
          URL.revokeObjectURL(url)
        })
      } else {
        reject(new Error('Failed to get canvas context'))
      }
    }

    video.addEventListener('loadeddata', () => {
      console.log('loadeddata event triggered')
      if (video.readyState >= 2) {
        requestAnimationFrame(handleLoadedData)
      } else {
        video.currentTime = 0 // Seek near the beginning
        video.addEventListener('seeked', handleLoadedData, { once: true })
      }
    })

    video.addEventListener('error', (e) => {
      console.error('Error loading video:', e)
      reject(new Error(`Failed to load video: ${e.message}`))
    })
  })

export const getOrCreateThumbnail = async (videoUrl: string): Promise<Blob> => {
  if (thumbnailBlobCache[videoUrl]) {
    return Promise.resolve(thumbnailBlobCache[videoUrl]!)
  }

  if (!thumbnailGenerationPromises[videoUrl]) {
    thumbnailGenerationPromises[videoUrl] = fetchVideoBlob(videoUrl)
      .then((blob) => createThumbnailFromVideoBlob(blob))
      .then((thumbnailBlob) => {
        thumbnailBlobCache[videoUrl] = thumbnailBlob
        return thumbnailBlob
      })
      .finally(() => {
        delete thumbnailGenerationPromises[videoUrl]
      })
  }

  return thumbnailGenerationPromises[videoUrl]!
}
