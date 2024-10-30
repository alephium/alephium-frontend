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

import { AlephiumApp as AlephiumLedgerApp } from '@alephium/ledger-app'
import { getHumanReadableError } from '@alephium/shared'
import web3 from '@alephium/web3-wallet'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { listen } from '@ledgerhq/logs'
import { app, BrowserWindow, ipcMain, nativeImage, protocol, shell } from 'electron'
import contextMenu from 'electron-context-menu'
import isDev from 'electron-is-dev'
import path from 'path'

import { configureAutoUpdater, handleAutoUpdaterUserActions, setupAutoUpdaterListeners } from './autoUpdater'
import { setupAppMenu } from './menu'
import { handleNativeThemeUserActions, setupNativeThemeListeners } from './nativeTheme'
import { IS_RC, isMac, isWindows } from './utils'

configureAutoUpdater()

let alephiumLedgerApp

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
let mainWindow: Electron.BrowserWindow | null

// Build menu

const appURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`

let deepLinkUri: string | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: isWindows ? 'default' : 'hidden',
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  })

  setupAppMenu(mainWindow)

  if (!isMac && !isWindows) {
    mainWindow.setIcon(
      nativeImage.createFromPath(path.join(__dirname, isDev ? 'icons/logo-48.png' : '../build/icons/logo-48.png'))
    )
  }

  mainWindow.loadURL(appURL)

  if (isDev || IS_RC) {
    // Open the DevTools.
    mainWindow?.webContents.openDevTools()
  }

  // Set default window open handler (open new windows in the web browser by default)
  mainWindow?.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => (mainWindow = null))

  setupNativeThemeListeners(mainWindow)
  setupAutoUpdaterListeners(mainWindow)

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
    await installExtension(REACT_DEVELOPER_TOOLS)
    await installExtension(REDUX_DEVTOOLS)
  }

  handleNativeThemeUserActions()
  handleAutoUpdaterUserActions()

  ipcMain.handle('app:hide', () => {
    if (isWindows) {
      mainWindow?.blur()
    } else {
      app.hide()
    }
  })

  ipcMain.handle('app:show', () => {
    if (isWindows) {
      mainWindow?.minimize()
      mainWindow?.restore()
    } else {
      mainWindow?.show()
    }
  })

  ipcMain.handle('app:getSystemLanguage', () => {
    const preferedLanguages = app.getPreferredSystemLanguages()

    if (preferedLanguages.length > 0) return preferedLanguages[0]
  })

  ipcMain.handle('app:getSystemRegion', () => app.getSystemLocale())

  ipcMain.handle('app:setProxySettings', async (_, proxySettings) => {
    const { address, port } = proxySettings
    const proxyRules = !address && !port ? undefined : `socks5://${address}:${port}`

    try {
      await mainWindow?.webContents.session.setProxy({ proxyRules })
    } catch (e) {
      console.error(e)
    }
  })

  ipcMain.handle('app:restart', () => {
    app.relaunch()
    app.exit()
  })

  ipcMain.handle('wc:getDeepLinkUri', () => deepLinkUri)

  ipcMain.handle('wc:resetDeepLinkUri', () => {
    deepLinkUri = null
  })

  ipcMain.handle('ledger:connectViaUsb', async () => {
    const connect = async () => {
      console.log('🔌... connecting to Ledger via USB')

      const transport = await TransportNodeHid.open('')

      console.log('🔌✅ connected to Ledger via USB!')

      if (isDev) {
        listen((log) => console.log('Ledger log message:', log.message))
      }

      alephiumLedgerApp = new AlephiumLedgerApp(transport)

      const version = await alephiumLedgerApp.getVersion()

      console.log('🔌✅ Ledger version:', version)

      const keyType = 'default'

      const initialAddressPath = web3.getHDWalletPath(keyType, 0)

      const [account, _] = await alephiumLedgerApp.getAccount(initialAddressPath, undefined, keyType)

      const response = {
        success: true,
        version,
        initialAddress: { hash: account.address, index: 0, publicKey: account.publicKey },
        deviceModel: alephiumLedgerApp.transport.deviceModel?.productName
      }

      transport.close()

      return response
    }

    try {
      return await connect()
    } catch (error) {
      console.error('🔌❌', error)

      // Retry one more time if the error is unknown, usually the Ledger app needs a moment
      if (getHumanReadableError(error, '').includes('UNKNOWN_ERROR')) {
        return new Promise((s) => setTimeout(s, 1000)).then(connect).catch((error) => ({ success: false, error }))
      }

      return { success: false, error }
    }
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
  shell.openExternal(pagePath)
})
