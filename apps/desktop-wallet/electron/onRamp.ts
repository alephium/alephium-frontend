import { BrowserWindow, ipcMain } from 'electron'

export const handleOnRampWindows = (mainWindow: BrowserWindow | null) => {
  let onRampWindow: BrowserWindow | null

  ipcMain.handle('app:openOnRampServiceWindow', (event, { url, targetLocation }) => {
    if (onRampWindow) {
      onRampWindow.show()
      return
    }

    onRampWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        contextIsolation: true,
        webSecurity: true
      }
    })

    onRampWindow.loadURL(url)

    onRampWindow.webContents.on('did-navigate', (event, currentUrl) => {
      console.log(`Navigated to: ${currentUrl}`)
      if (currentUrl.includes(targetLocation)) {
        onRampWindow?.close()
        onRampWindow = null

        mainWindow?.webContents.send('target-location-reached')
      }
    })

    // Ensure window reference is cleaned up
    onRampWindow.on('closed', () => {
      onRampWindow = null
    })

    // Handle child windows opening (onramper opens provider in a new window)
    onRampWindow.webContents.setWindowOpenHandler(({ url }) => {
      const childWindow = new BrowserWindow({
        parent: onRampWindow!,
        width: 800,
        height: 600,
        webPreferences: {
          contextIsolation: true,
          webSecurity: true
        }
      })
      childWindow.loadURL(url)

      // Listen for navigation events on the new window
      childWindow.webContents.on('did-navigate', (event, currentUrl) => {
        console.log(`Child window navigated to: ${currentUrl}`)
        if (currentUrl.includes(targetLocation)) {
          childWindow?.close()
          onRampWindow?.close()
          onRampWindow = null

          mainWindow?.webContents.send('target-location-reached')
        }
      })

      // Prevent the default action (which would be Electron creating a default window)
      return { action: 'deny' }
    })
  })
}
