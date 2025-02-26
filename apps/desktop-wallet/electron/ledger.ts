import { ledgerUSBVendorId } from '@ledgerhq/devices'
import { BrowserWindow } from 'electron'

import { APP_PROTOCOL } from './appProtocol'

export const setupLedgerDevicePermissions = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    const { deviceType, origin, device } = details

    const isCorrectDeviceType = deviceType === 'hid' || deviceType === 'usb'
    const isCorrectOrigin = origin.startsWith(`${APP_PROTOCOL}://`) || origin.startsWith('http://localhost:3000')
    const isCorrectVendor = device.vendorId === ledgerUSBVendorId

    const shouldAllow = isCorrectDeviceType && isCorrectOrigin && isCorrectVendor

    return shouldAllow
  })
}
