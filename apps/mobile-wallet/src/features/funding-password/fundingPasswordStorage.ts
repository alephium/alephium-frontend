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

const FUNDING_PASSWORD_KEY = 'funding-password'

export const storeFundingPassword = (password: string) =>
  storeSecurelyWithReportableError(FUNDING_PASSWORD_KEY, password, 'Could not store funding password')

export const getFundingPassword = () => SecureStore.getItemAsync(FUNDING_PASSWORD_KEY, defaultSecureStoreConfig)

export const hasStoredFundingPassword = async () => !!(await getFundingPassword())

export const deleteFundingPassword = () =>
  deleteSecurelyWithReportableError(FUNDING_PASSWORD_KEY, 'Could not delete funding password')
