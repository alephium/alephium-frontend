import path from 'node:path'

import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import contextMenu from 'electron-context-menu'
import isDev from 'electron-is-dev'

import { registerAppProtocol } from './appProtocol'
import { configureAutoUpdater, handleAutoUpdaterUserActions, setupAutoUpdaterListeners } from './autoUpdater'
import { setupLedgerDevicePermissions } from './ledger'
import { setupAppMenu } from './menu'
import { handleNativeThemeUserActions, setupNativeThemeListeners } from './nativeTheme'
import { handleOnRampWindows } from './onRamp'
import { ICON_PATH } from './paths'
import { IS_RC, isIpcSenderValid, isMac, isWindows } from './utils'
import {
  handleWalletConnectDeepLink,
  handleWindowsWalletConnectDeepLink,
  initializeWalletConnectDeepLinkUri,
  setupWalletConnectDeepLinkIPCHandlers
} from './walletConnect'

configureAutoUpdater()

// See https://github.com/alephium/alephium-frontend/issues/176
const OLD_APP_NAME = 'alephium-wallet'
app.setName(OLD_APP_NAME)

// Expose Garbage Collector flag for manual trigger
app.commandLine.appendSwitch('js-flags', '--expose-gc')

registerAppProtocol()

contextMenu()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null
let preventQuitting = true

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: ICON_PATH,
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    frame: isMac,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 8, y: 8 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true
    }
  })

  setupAppMenu(mainWindow)

  if (!isMac && !isWindows) {
    mainWindow.setIcon(nativeImage.createFromPath(ICON_PATH))
  }

  if (process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    // mainWindow.loadURL(`${APP_PROTOCOL}://${RENDERER_PATH}/index.html`)
    // TODO: Once https://github.com/alephium/alephium-frontend/issues/176 is fixed, remove following line in favor of
    // the one above.
    mainWindow.loadFile(path.join(path.join(path.join(__dirname, '..'), 'build'), 'index.html'))
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

  const cleanupThemeListeners = setupNativeThemeListeners(mainWindow)

  mainWindow.on('closed', () => {
    cleanupThemeListeners()
    mainWindow = null
  })

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('window:focus', true)
  })

  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('window:focus', false)
  })

  setupAutoUpdaterListeners(mainWindow)

  setupLedgerDevicePermissions(mainWindow)

  initializeWalletConnectDeepLinkUri()
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

    handleWindowsWalletConnectDeepLink(mainWindow, args)
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

  // TODO: Once https://github.com/alephium/alephium-frontend/issues/176 is fixed, uncomment following line
  // handleAppProtocolRequests()

  handleNativeThemeUserActions()

  handleAutoUpdaterUserActions()

  handleOnRampWindows(mainWindow)

  ipcMain.handle('app:hide', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    if (isWindows) {
      mainWindow?.blur()
    } else {
      app.hide()
    }
  })

  ipcMain.handle('app:quit', ({ senderFrame }) => {
    if (!isIpcSenderValid(senderFrame)) return null

    preventQuitting = false

    app.quit()
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

  setupWalletConnectDeepLinkIPCHandlers()

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

app.on('open-url', (_, url) => handleWalletConnectDeepLink(url, mainWindow))

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
  const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
  const pagePath = path.join('file://', pageDirectory, 'index.html')
  // TODO: Review use of openExternal.
  // See https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content
  shell.openExternal(pagePath)
})

app.on('before-quit', (event) => {
  if (preventQuitting) {
    event.preventDefault()

    if (mainWindow) {
      mainWindow.webContents.send('app:before-quit')
    } else {
      preventQuitting = false
      app.quit()
    }
  }
})
