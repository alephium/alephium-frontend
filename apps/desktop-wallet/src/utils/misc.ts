import { SHORT_DATE_TIME_OPTIONS } from '@alephium/shared'
import { sha512 } from '@noble/hashes/sha2'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils'
import { KeyboardEvent } from 'react'

// ===================== //
// ==== RUNNING ENV ==== //
// ===================== //

export const isElectron = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.indexOf(' electron/') > -1
}

// ================= //
// ===== LINKS ===== //
// ================= //

// Renderer-side mirror of electron/utils.ts#isAllowedExternalUrl (keep in sync) — a second layer
// behind the main-process setWindowOpenHandler allowlist so untrusted strings (e.g. on-chain
// NFT/token metadata) never reach shell.openExternal with a dangerous scheme. https/mailto always;
// http only for loopback/private hosts (devnet + LAN); everything else (file:, smb:, custom
// protocols, public http) is rejected.
const isLoopbackOrPrivateHost = (hostname: string) => {
  if (hostname === 'localhost' || hostname === '::1') return true

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(hostname)
  if (!ipv4) return false

  const a = Number(ipv4[1])
  const b = Number(ipv4[2])

  return (
    a === 127 || // loopback 127.0.0.0/8
    a === 10 || // private 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) || // private 172.16.0.0/12
    (a === 192 && b === 168) || // private 192.168.0.0/16
    (a === 169 && b === 254) // link-local 169.254.0.0/16
  )
}

const isAllowedExternalUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url)

    if (protocol === 'https:' || protocol === 'mailto:') return true
    if (protocol === 'http:') return isLoopbackOrPrivateHost(hostname)

    return false
  } catch {
    return false
  }
}

export const openInWebBrowser = (url: string) => {
  if (!url) return

  const sanitizedUrl = url.replace(/([^:]\/)\/+/g, '$1')

  if (!isAllowedExternalUrl(sanitizedUrl)) return

  const newWindow = window.open(sanitizedUrl, '_blank', 'noopener,noreferrer')
  if (newWindow) {
    newWindow.opener = null
    newWindow.focus()
  }
}

// Output is used as a stable localStorage key during legacy data migrations — do not change the hashing algorithm.
export const stringToDoubleSHA512HexString = (data: string): string => bytesToHex(sha512(sha512(utf8ToBytes(data))))

export const formatDateForDisplay = (date: Date | number, locale?: string): string =>
  new Intl.DateTimeFormat(locale, SHORT_DATE_TIME_OPTIONS).format(new Date(date))

export const getInitials = (str: string) => {
  if (!str) return ''

  const words = str.split(' ')
  const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}` : str.length > 1 ? str.substring(0, 2) : str[0]

  return initials.toUpperCase()
}

export const onEnterOrSpace = (event: KeyboardEvent, callback: () => void) => {
  if (event.key !== 'Enter' && event.key !== ' ') return

  event.stopPropagation()
  callback()
}

export const onTabPress = (event: KeyboardEvent, callback: () => void) => {
  if (event.key !== 'Tab') return

  event.stopPropagation()
  callback()
}

export function removeItemFromArray<T>(array: T[], index: number) {
  const newArray = [...array]
  newArray.splice(index, 1)
  return newArray
}

export const cleanUrl = (url: string) => url.replace('https://', '')

export const restartElectron = () => {
  window.electron?.app.restart()
}
