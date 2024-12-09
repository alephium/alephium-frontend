/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

import { IS_RC, isIpcSenderValid } from './utils'

export const configureAutoUpdater = () => {
  autoUpdater.autoDownload = false
  autoUpdater.allowPrerelease = IS_RC
}

export const setupAutoUpdaterListeners = (mainWindow: BrowserWindow) => {
  autoUpdater.on('download-progress', (info) => mainWindow.webContents.send('updater:download-progress', info))

  autoUpdater.on('error', (error) => mainWindow.webContents.send('updater:error', error))

  autoUpdater.on('update-downloaded', (event) => mainWindow.webContents.send('updater:updateDownloaded', event))
}

export const handleAutoUpdaterUserActions = () => {
  ipcMain.handle('updater:checkForUpdates', async ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    try {
      const result = await autoUpdater.checkForUpdates()

      return result?.updateInfo?.version
    } catch (e) {
      console.error(e)
    }
  })

  ipcMain.handle('updater:startUpdateDownload', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:quitAndInstallUpdate', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    autoUpdater.quitAndInstall()
  })
}
