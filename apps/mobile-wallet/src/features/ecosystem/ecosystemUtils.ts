import { getHostFromUrl, isValidRemoteHttpUrl, normalizeHost } from '@alephium/shared/utils'

import type { DApp } from '~/features/ecosystem/ecosystemTypes'

export const getValidUrl = (text: string) => {
  const missingProtocol = !text.startsWith('http://') && !text.startsWith('https://')
  const urlToLoad = missingProtocol ? `https://${text}` : text

  return isValidRemoteHttpUrl(urlToLoad) ? urlToLoad : undefined
}

// Builds the set of normalized hosts of the dApps listed in the alph.land directory.
export const getKnownDappHosts = (dApps: DApp[]): Set<string> => {
  const hosts = new Set<string>()

  for (const dApp of dApps) {
    const website = dApp.links?.website
    const host = website ? normalizeHost(getHostFromUrl(website)) : undefined

    if (host) hosts.add(host)
  }

  return hosts
}

export const isDappHostVerified = (host: string, knownHosts: Set<string>): boolean => {
  const normalized = normalizeHost(host)

  return normalized !== undefined && knownHosts.has(normalized)
}
