import { BrowserWindow, ipcMain, nativeTheme } from 'electron'

import { isIpcSenderValid } from './utils'

export const setupNativeThemeListeners = (mainWindow: BrowserWindow) => {
  nativeTheme.on('updated', () =>
    mainWindow.webContents.send('theme:shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
  )
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
