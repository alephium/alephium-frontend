import { useEffect, useRef, useState } from 'react'

import { getNftImageBlob } from '@/features/thumbnails/nftImageStorage'

// data: URIs are already inline in the metadata, so there is nothing to fetch or cache.
const isInlineUri = (url: string) => url.startsWith('data:')

interface CachedNftImage {
  src?: string
  isLoading: boolean
}

const useCachedNftImage = (imageUrl: string, fullResolution = false): CachedNftImage => {
  const [state, setState] = useState<{ src?: string; isLoading: boolean }>({ isLoading: !isInlineUri(imageUrl) })
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    if (isInlineUri(imageUrl)) {
      setState({ src: imageUrl, isLoading: false })
      return
    }

    let cancelled = false
    let fullLoaded = false
    setState({ isLoading: true })

    const toObjectUrl = (blob: Blob) => {
      const objectUrl = URL.createObjectURL(blob)
      objectUrlsRef.current.push(objectUrl)
      return objectUrl
    }

    // In the full-resolution modal, show the already-cached thumbnail instantly as a placeholder, then upgrade to the
    // full image once it arrives (fetching the full source can take a moment).
    if (fullResolution) {
      getNftImageBlob(imageUrl, false)
        .then((blob) => {
          if (cancelled || fullLoaded) return
          setState({ src: toObjectUrl(blob), isLoading: false })
        })
        .catch(() => {})
    }

    getNftImageBlob(imageUrl, fullResolution)
      .then((blob) => {
        if (cancelled) return
        fullLoaded = true
        setState({ src: toObjectUrl(blob), isLoading: false })
      })
      .catch(() => {
        // A host without permissive CORS blocks fetch(), but <img> can still load it cross-origin - just uncached.
        // Keep the thumbnail placeholder if we already have one.
        if (!cancelled && !fullLoaded)
          setState((current) => (current.src ? current : { src: imageUrl, isLoading: false }))
      })

    return () => {
      cancelled = true
      objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
      objectUrlsRef.current = []
    }
  }, [imageUrl, fullResolution])

  // Cached images are small downscaled thumbnails, so we keep each mounted tile's object URL alive until unmount
  // instead of revoking on decode - memory stays low and the modal can swap placeholder -> full without any juggling.
  return state
}

export default useCachedNftImage
