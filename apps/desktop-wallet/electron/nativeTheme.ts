import { BrowserWindow, ipcMain, nativeTheme } from 'electron'

import { isIpcSenderValid } from './utils'

export const setupNativeThemeListeners = (mainWindow: BrowserWindow) => {
  const themeUpdateHandler = () => {
    if (!mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('theme:shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
    }
  }

  nativeTheme.on('updated', themeUpdateHandler)

  // Return a cleanup function to remove the listener
  return () => {
    nativeTheme.removeListener('updated', themeUpdateHandler)
  }
}

export const handleNativeThemeUserActions = () => {
  ipcMain.handle('theme:setNativeTheme', ({ senderFrame }, theme) => {
    if (!isIpcSenderValid(senderFrame)) return null

    nativeTheme.themeSource = theme
  })

  // nativeTheme must be reassigned like this because its properties are all computed, so
  // they can't be serialized to be passed over channels.
  ipcMain.handle('theme:getNativeTheme', ({ sender, senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    sender.send('theme:getNativeTheme', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      themeSource: nativeTheme.themeSource
    })
  })
}
