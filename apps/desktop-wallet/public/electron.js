/*
Copyright 2018 - 2023 The Alephium Authors
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

// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, shell, nativeImage, protocol } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const contextMenu = require('electron-context-menu')
const { autoUpdater } = require('electron-updater')

const CURRENT_VERSION = app.getVersion()
const IS_RC = CURRENT_VERSION.includes('-rc.')

// Handle deep linking for alephium://
const ALEPHIUM = 'alephium'
const ALEPHIUM_WALLET_CONNECT_DEEP_LINK_PREFIX = `${ALEPHIUM}://wc`
const ALEPHIUM_WALLET_CONNECT_URI_PREFIX = '?uri='

// See https://github.com/alephium/alephium-frontend/issues/176
const OLD_APP_NAME = 'alephium-wallet'
app.setName(OLD_APP_NAME)

protocol.registerSchemesAsPrivileged([{ scheme: ALEPHIUM, privileges: { secure: true, standard: true } }])
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(ALEPHIUM, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(ALEPHIUM)
}

contextMenu()

autoUpdater.autoDownload = false
autoUpdater.allowPrerelease = IS_RC

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Build menu

const isMac = process.platform === 'darwin'
const isWindows = process.platform === 'win32'

const template = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }
      ]
    : []),
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
            }
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      ...(isMac ? [{ role: 'zoom' }, { type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])
    ]
  },
  {
    role: 'help',
    submenu: [
      ...(isMac
        ? []
        : isWindows
          ? [{ role: 'about' }, { type: 'separator' }]
          : [
              {
                label: 'About',
                click: async () => {
                  dialog.showMessageBox(mainWindow, {
                    message: `Version ${CURRENT_VERSION}`,
                    title: 'About',
                    type: 'info'
                  })
                }
              }
            ]),
      {
        label: 'Report an issue',
        click: async () => {
          await shell.openExternal('https://github.com/alephium/alephium-frontend/issues/new')
        }
      },
      {
        label: 'Get some help',
        click: async () => {
          await shell.openExternal('https://discord.gg/JErgRBfRSB')
        }
      }
    ]
  }
]

const appURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`

let deepLinkUri = null

function createWindow() {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: isWindows ? 'default' : 'hidden',
    webPreferences: {
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  })

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

  nativeTheme.on('updated', () =>
    mainWindow?.webContents.send('theme:shouldUseDarkColors', nativeTheme.shouldUseDarkColors)
  )

  mainWindow.on('closed', () => (mainWindow = null))

  autoUpdater.on('download-progress', (info) => mainWindow?.webContents.send('updater:download-progress', info))

  autoUpdater.on('error', (error) => mainWindow?.webContents.send('updater:error', error))

  autoUpdater.on('update-downloaded', (event) => mainWindow?.webContents.send('updater:updateDownloaded', event))

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
  return
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
      default: { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS }
    } = await import('electron-devtools-installer')
    await installExtension(REACT_DEVELOPER_TOOLS)
    await installExtension(REDUX_DEVTOOLS)
  }

  ipcMain.handle('theme:setNativeTheme', (_, theme) => (nativeTheme.themeSource = theme))

  // nativeTheme must be reassigned like this because its properties are all computed, so
  // they can't be serialized to be passed over channels.
  ipcMain.handle('theme:getNativeTheme', ({ sender }) =>
    sender.send('theme:getNativeTheme', {
      shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
      themeSource: nativeTheme.themeSource
    })
  )

  ipcMain.handle('updater:checkForUpdates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()

      return result?.updateInfo?.version
    } catch (e) {
      console.error(e)
    }
  })

  ipcMain.handle('updater:startUpdateDownload', () => autoUpdater.downloadUpdate())

  ipcMain.handle('updater:quitAndInstallUpdate', () => autoUpdater.quitAndInstall())

  ipcMain.handle('app:hide', () => {
    if (isWindows) {
      mainWindow.minimize()
    } else {
      app.hide()
    }
  })

  ipcMain.handle('app:show', () => {
    if (isWindows) {
      mainWindow.restore()
    } else {
      mainWindow.show()
    }
  })

  ipcMain.handle('app:getSystemLanguage', () => {
    const preferedLanguages = app.getPreferredSystemLanguages()

    if (preferedLanguages.length > 0) return preferedLanguages[0]
  })

  ipcMain.handle('app:setProxySettings', async (_, proxySettings) => {
    const { address, port } = proxySettings
    const proxyRules = !address && !port ? undefined : `socks5://${address}:${port}`

    try {
      await mainWindow.webContents.session.setProxy({ proxyRules })
    } catch (e) {
      console.error(e)
    }
  })

  ipcMain.handle('wc:getDeepLinkUri', () => deepLinkUri)

  ipcMain.handle('wc:resetDeepLinkUri', () => {
    deepLinkUri = null
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

const extractWalletConnectUri = (url) =>
  url.substring(url.indexOf(ALEPHIUM_WALLET_CONNECT_URI_PREFIX) + ALEPHIUM_WALLET_CONNECT_URI_PREFIX.length)

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
  const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
  const pagePath = path.join('file://', pageDirectory, 'index.html')
  shell.openExternal(pagePath)
})
