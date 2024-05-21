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
  deleteSecurelyWithReportableError,
  deleteWithReportableError,
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'

const FUND_PASSWORD_KEY = 'fund-password'
const FUND_PASSWORD_REMINDER_KEY = 'fund-password-reminder-needed'

export const storeFundPassword = (password: string) =>
  storeSecurelyWithReportableError(FUND_PASSWORD_KEY, password, true, '')

export const getFundPassword = () => getSecurelyWithReportableError(FUND_PASSWORD_KEY, true, '')

export const hasStoredFundPassword = async () => !!(await getFundPassword())

export const deleteFundPassword = async () => {
  await deleteSecurelyWithReportableError(FUND_PASSWORD_KEY, true, '')
  await deleteFundPasswordReminder()
}

export const needsFundPasswordReminder = async (): Promise<boolean> =>
  (await getWithReportableError(FUND_PASSWORD_REMINDER_KEY)) === 'true'

export const setNeedsFundPasswordReminder = () => storeWithReportableError(FUND_PASSWORD_REMINDER_KEY, 'true')

export const deleteFundPasswordReminder = () => deleteWithReportableError(FUND_PASSWORD_REMINDER_KEY)
