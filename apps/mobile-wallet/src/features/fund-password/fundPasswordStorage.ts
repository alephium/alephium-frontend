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

import * as SecureStore from 'expo-secure-store'

import { defaultSecureStoreConfig } from '~/persistent-storage/config'
import { deleteSecurelyWithReportableError, storeSecurelyWithReportableError } from '~/persistent-storage/utils'

const FUND_PASSWORD_KEY = 'fund-password'

export const storeFundPassword = (password: string) =>
  storeSecurelyWithReportableError(FUND_PASSWORD_KEY, password, 'Could not store fund password')

export const getFundPassword = () => SecureStore.getItemAsync(FUND_PASSWORD_KEY, defaultSecureStoreConfig)

export const hasStoredFundPassword = async () => !!(await getFundPassword())

export const deleteFundPassword = () =>
  deleteSecurelyWithReportableError(FUND_PASSWORD_KEY, 'Could not delete fund password')
