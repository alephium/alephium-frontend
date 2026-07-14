export const getHostFromUrl = (url: string): string | undefined => {
  try {
    return new URL(url).host || undefined
  } catch {
    return undefined
  }
}

export const normalizeHost = (host: string | undefined): string | undefined =>
  host ? host.toLowerCase().replace(/^www\./, '') : undefined

export const getDappHost = (urlOrHost?: string): string | undefined => {
  if (!urlOrHost) return undefined

  return normalizeHost(getHostFromUrl(urlOrHost.includes('://') ? urlOrHost : `https://${urlOrHost}`))
}
