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

import { app, WebFrameMain } from 'electron'

export const isMac = process.platform === 'darwin'

export const isWindows = process.platform === 'win32'

export const CURRENT_VERSION = app.getVersion()

export const IS_RC = CURRENT_VERSION.includes('-rc.')

// See: https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
export const isIpcSenderValid = (frame: WebFrameMain | null) => frame && new URL(frame.url).host === 'localhost:3000'
