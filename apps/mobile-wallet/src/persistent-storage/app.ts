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

import {
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'

const INSTALLED_ON = 'app-installed-on'
const INSTALLED_ON_PERSISTENT = 'app-installed-on-persistent'

export const rememberAppInstallation = async () => {
  const timestamp = new Date().getTime().toString()

  await storeWithReportableError(INSTALLED_ON, timestamp)
  await storeSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, timestamp, true, '')
}

export const wasAppUninstalled = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, true, '')) &&
  !(await getWithReportableError(INSTALLED_ON))

export const appInstallationTimestampMissing = async () =>
  !(await getSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, true, ''))
