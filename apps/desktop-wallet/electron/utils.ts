import { app, WebFrameMain } from 'electron'

export const isMac = process.platform === 'darwin'

export const isWindows = process.platform === 'win32'

export const CURRENT_VERSION = app.getVersion()

export const IS_RC = CURRENT_VERSION.includes('-rc.')

// See: https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
export const isIpcSenderValid = (frame: WebFrameMain | null) => frame && new URL(frame.url).host === 'localhost:3000'
