import { app, WebFrameMain } from 'electron'

import { APP_PROTOCOL } from './appProtocol'

export const isMac = process.platform === 'darwin'

export const isWindows = process.platform === 'win32'

export const CURRENT_VERSION = app.getVersion()

export const IS_RC = CURRENT_VERSION.includes('-rc.')

// See: https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
export const isIpcSenderValid = (frame: WebFrameMain | null) => {
  if (frame) {
    const url = new URL(frame.url)

    return (
      url.protocol === `${APP_PROTOCOL}:` || // for production builds
      url.host === 'localhost:3000' // for dev environment
    )
  } else {
    return false
  }
}
