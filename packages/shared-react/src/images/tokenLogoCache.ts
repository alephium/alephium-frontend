import { createImageBlobCache } from './imageBlobCache'

// Listed-token logos are served straight out of the token-list git repo, where many are multi-megabyte PNGs rendered
// at ~32px. Caching downscaled copies keeps the app off that host, which rate-limits (HTTP 429) under normal wallet
// traffic because it is not a CDN.
const tokenLogoCache = createImageBlobCache({ dbName: 'TokenLogosDB', dbVersion: 1, maxDimension: 128 })

export const getTokenLogoBlob = (url: string) => tokenLogoCache.getImageBlob(url)

export const deleteTokenLogosDB = tokenLogoCache.deleteDatabase
