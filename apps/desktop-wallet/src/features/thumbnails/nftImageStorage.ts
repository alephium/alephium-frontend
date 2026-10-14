import { createImageBlobCache } from '@alephium/shared-react/images'

// NFT sources are often multi-thousand-pixel images shown in ~150px grid tiles, which is expensive to decode and
// keep in memory at scale. We downscale once to this longest-side cap and cache the result: scrolling stays cheap and
// the on-disk cache stays small. The detail modal asks for the full-resolution image instead (see getNftImageBlob).
const MAX_THUMBNAIL_DIMENSION = 512

// dbVersion must be bumped whenever the cached value format changes, otherwise stale entries are served forever.
const nftImageCache = createImageBlobCache({
  dbName: 'NftImagesDB',
  dbVersion: 2,
  maxDimension: MAX_THUMBNAIL_DIMENSION
})

export const getNftImageBlob = (url: string, fullResolution = false): Promise<Blob> =>
  nftImageCache.getImageBlob(url, { originalResolution: fullResolution })

export const deleteNftImagesDB = nftImageCache.deleteDatabase
