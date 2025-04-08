import { createHash } from '@alephium/shared-crypto'
import dayjs from 'dayjs'
import { Children, Fragment, isValidElement, KeyboardEvent, ReactNode } from 'react'

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

export const formatDateForDisplay = (date: Date | number): string => dayjs(date).format('YYYY-MM-DD HH:mm')

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateChildrenType = <T extends (props: any) => ReactNode>({
  children,
  childType,
  parentName
}: {
  children: ReactNode
  childType: T
  parentName: string
}) => {
  Children.forEach(children, (child) => {
    if (!child || !isValidElement(child)) return

    if (child.type === Fragment) {
      validateChildrenType({ children: child.props.children, childType, parentName })
    } else if (child.type !== childType) {
      console.error(
        `${parentName} only accepts ${childType.name} as children. Invalid child type: ${child.type.toString()}.`
      )
    }
  })
}
