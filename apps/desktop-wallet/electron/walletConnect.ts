import { BrowserWindow, ipcMain } from 'electron'

import { APP_PROTOCOL } from './appProtocol'
import { isIpcSenderValid, isMac } from './utils'

const ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX = `${APP_PROTOCOL}://wc`
const ALEPHIUM_WALLET_CONNECT_URI_PREFIX = '?uri='

let deepLinkUri: string | null = null

export const initializeWalletConnectDeepLinkUri = () => {
  if (!isMac) {
    if (process.argv.length > 1) {
      const url = findWalletConnectUrlInArgs(process.argv)

      if (url) {
        deepLinkUri = extractWalletConnectUri(url)
      }
    }
  }

  return deepLinkUri
}

export const handleWalletConnectDeepLink = (url: string, mainWindow: BrowserWindow | null) => {
  if (startsWithWalletConnectPrefix(url)) {
    deepLinkUri = extractWalletConnectUri(url)

    if (mainWindow) mainWindow?.webContents.send('wc:connect', deepLinkUri)
  }
}

export const handleWindowsWalletConnectDeepLink = (mainWindow: BrowserWindow, args: string[]) => {
  if (args.length > 1) {
    const url = findWalletConnectUrlInArgs(args)

    if (url) {
      deepLinkUri = extractWalletConnectUri(url)
      mainWindow.webContents.send('wc:connect', deepLinkUri)
    }
  }
}

export const setupWalletConnectDeepLinkIPCHandlers = () => {
  ipcMain.handle('wc:getDeepLinkUri', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    return deepLinkUri
  })

  ipcMain.handle('wc:resetDeepLinkUri', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    deepLinkUri = null
  })
}

const extractWalletConnectUri = (url: string) =>
  url.substring(url.indexOf(ALEPHIUM_WALLET_CONNECT_URI_PREFIX) + ALEPHIUM_WALLET_CONNECT_URI_PREFIX.length)

const findWalletConnectUrlInArgs = (args: string[]) => args.find(startsWithWalletConnectPrefix)

const startsWithWalletConnectPrefix = (str: string) => str.startsWith(ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX)
