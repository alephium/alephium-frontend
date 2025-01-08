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

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, ipcMain, nativeImage, protocol, shell } from 'electron'
import contextMenu from 'electron-context-menu'
import isDev from 'electron-is-dev'

import { configureAutoUpdater, handleAutoUpdaterUserActions, setupAutoUpdaterListeners } from './autoUpdater'
import { setupLedgerDevicePermissions } from './ledger'
import { setupAppMenu } from './menu'
import { handleNativeThemeUserActions, setupNativeThemeListeners } from './nativeTheme'
import { IS_RC, isIpcSenderValid, isMac, isWindows } from './utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const APP_ROOT = path.join(__dirname, '..')
const RENDERER_DIST = path.join(APP_ROOT, 'build')
const VITE_PUBLIC = isDev ? path.join(APP_ROOT, 'public') : RENDERER_DIST
const ICON_PATH = path.join(VITE_PUBLIC, 'icons', 'logo-48.png')

configureAutoUpdater()

// Handle deep linking for alephium://
const ALEPHIUM = 'alephium'
const ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX = `${ALEPHIUM}://wc`
const ALEPHIUM_WALLET_CONNECT_URI_PREFIX = '?uri='

// See https://github.com/alephium/alephium-frontend/issues/176
const OLD_APP_NAME = 'alephium-wallet'
app.setName(OLD_APP_NAME)

// Expose Garbage Collector flag for manual trigger
app.commandLine.appendSwitch('js-flags', '--expose-gc')

protocol.registerSchemesAsPrivileged([{ scheme: ALEPHIUM, privileges: { secure: true, standard: true } }])
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(ALEPHIUM, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(ALEPHIUM)
}

contextMenu()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null

let deepLinkUri: string | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: ICON_PATH,
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    frame: false, // Remove default frame
    titleBarStyle: isWindows ? 'default' : 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  })

  setupAppMenu(mainWindow)

  if (!isMac && !isWindows) {
    mainWindow.setIcon(nativeImage.createFromPath(ICON_PATH))
  }

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  if (isDev || IS_RC) {
    // Open the DevTools.
    mainWindow?.webContents.openDevTools()
  }

  // Set default window open handler (open new windows in the web browser by default)
  mainWindow?.webContents.setWindowOpenHandler(({ url }) => {
    // TODO: Review use of openExternal.
    // See https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => (mainWindow = null))

  setupNativeThemeListeners(mainWindow)

  setupAutoUpdaterListeners(mainWindow)

  setupLedgerDevicePermissions(mainWindow)

  if (!isMac) {
    if (process.argv.length > 1) {
      const url = process.argv.find((arg) => arg.startsWith(ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX))

      if (url) {
        deepLinkUri = extractWalletConnectUri(url)
      }
    }
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

// Activate the window of primary instance when a second instance starts
app.on('second-instance', (_event, args) => {
  if (mainWindow) {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()

    // Handle deep-link for Windows
    if (args.length > 1) {
      const url = args.find((arg) => arg.startsWith(ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX))

      if (url) {
        deepLinkUri = extractWalletConnectUri(url)
        mainWindow?.webContents.send('wc:connect', deepLinkUri)
      }
    }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function () {
  if (isDev) {
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS
    } = await import('electron-devtools-installer')

    try {
      await installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
    } catch (e) {
      console.error('Failed to install devtools:', e)
    }
  }

  handleNativeThemeUserActions()

  handleAutoUpdaterUserActions()

  ipcMain.handle('app:hide', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    if (isWindows) {
      mainWindow?.blur()
    } else {
      app.hide()
    }
  })

  ipcMain.handle('app:show', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    if (isWindows) {
      mainWindow?.minimize()
      mainWindow?.restore()
    } else {
      mainWindow?.show()
    }
  })

  ipcMain.handle('app:getSystemLanguage', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    const preferedLanguages = app.getPreferredSystemLanguages()

    if (preferedLanguages.length > 0) return preferedLanguages[0]
  })

  ipcMain.handle('app:getSystemRegion', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    return app.getSystemLocale()
  })

  ipcMain.handle('app:setProxySettings', async ({ senderFrame }, proxySettings) => {
    if (!isIpcSenderValid(senderFrame)) return null

    const { address, port } = proxySettings
    const proxyRules = !address && !port ? undefined : `socks5://${address}:${port}`

    try {
      await mainWindow?.webContents.session.setProxy({ proxyRules })
    } catch (e) {
      console.error(e)
    }
  })

  ipcMain.handle('app:restart', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    app.relaunch()
    app.exit()
  })

  ipcMain.handle('wc:getDeepLinkUri', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    return deepLinkUri
  })

  ipcMain.handle('wc:resetDeepLinkUri', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    deepLinkUri = null
  })

  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  mainWindow?.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized', true)
  })

  mainWindow?.on('unmaximize', () => {
    mainWindow?.webContents.send('window:maximized', false)
  })
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

app.on('open-url', (_, url) => {
  if (url.startsWith(ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX)) {
    deepLinkUri = extractWalletConnectUri(url)
    if (mainWindow) mainWindow?.webContents.send('wc:connect', deepLinkUri)
  }
})

const extractWalletConnectUri = (url: string) =>
  url.substring(url.indexOf(ALEPHIUM_WALLET_CONNECT_URI_PREFIX) + ALEPHIUM_WALLET_CONNECT_URI_PREFIX.length)

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
  const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
  const pagePath = path.join('file://', pageDirectory, 'index.html')
  // TODO: Review use of openExternal.
  // See https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content
  shell.openExternal(pagePath)
})
