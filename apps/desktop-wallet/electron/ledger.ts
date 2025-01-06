import { ledgerUSBVendorId } from '@ledgerhq/devices'
import { BrowserWindow } from 'electron'

export const setupLedgerDevicePermissions = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.session.setDevicePermissionHandler(
    ({ deviceType, origin, device: { vendorId } }) =>
      (deviceType === 'hid' || deviceType === 'usb') &&
      (origin === 'file://' || origin === 'http://localhost:3000') &&
      vendorId === ledgerUSBVendorId
  )
}
