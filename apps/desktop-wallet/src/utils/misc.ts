import { SHORT_DATE_TIME_OPTIONS } from '@alephium/shared'
import { createHash } from '@alephium/shared-crypto'
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

export const openInWebBrowser = (url: string) => {
  if (url) {
    const newWindow = window.open(`${url.replace(/([^:]\/)\/+/g, '$1')}`, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.opener = null
      newWindow.focus()
    }
  }
}

export const stringToDoubleSHA256HexString = (data: string): string => {
  let hash

  hash = createHash('sha512')
  hash.update(data)
  const first = hash.digest()

  hash = createHash('sha512')
  hash.update(first)
  return hash.digest('hex')
}

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
