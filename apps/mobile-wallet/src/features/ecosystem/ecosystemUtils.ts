import { isValidRemoteHttpUrl } from '@alephium/shared'

export const getValidUrl = (text: string) => {
  const missingProtocol = !text.startsWith('http://') && !text.startsWith('https://')
  const urlToLoad = missingProtocol ? `https://${text}` : text

  return isValidRemoteHttpUrl(urlToLoad) ? urlToLoad : undefined
}
