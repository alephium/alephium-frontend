import { useEffect, useRef, useState } from 'react'

import { getTokenLogoBlob } from './tokenLogoCache'

interface CachedTokenLogo {
  src?: string
  isLoading: boolean
}

const isInlineUri = (url: string) => url.startsWith('data:')

export const useCachedTokenLogo = (logoUri?: string): CachedTokenLogo => {
  const [state, setState] = useState<CachedTokenLogo>({ isLoading: !!logoUri && !isInlineUri(logoUri) })
  const objectUrlRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const revokeObjectUrl = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = undefined
    }

    if (!logoUri) {
      setState({ isLoading: false })
      return
    }

    if (isInlineUri(logoUri)) {
      setState({ src: logoUri, isLoading: false })
      return
    }

    let cancelled = false
    setState({ isLoading: true })

    getTokenLogoBlob(logoUri)
      .then((blob) => {
        if (cancelled) return

        objectUrlRef.current = URL.createObjectURL(blob)
        setState({ src: objectUrlRef.current, isLoading: false })
      })
      .catch(() => {
        // A host without permissive CORS blocks fetch(), but <img> can still load it cross-origin - just uncached.
        if (!cancelled) setState({ src: logoUri, isLoading: false })
      })

    return () => {
      cancelled = true
      revokeObjectUrl()
    }
  }, [logoUri])

  return state
}
