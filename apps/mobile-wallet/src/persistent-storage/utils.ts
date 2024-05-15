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

import { getHumanReadableError } from '@alephium/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

import { sendAnalytics } from '~/analytics'
import { defaultSecureStoreConfig } from '~/persistent-storage/config'

export const storeWithReportableError = async (key: string, value: string, error: string) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    sendAnalytics('Error', { message: getHumanReadableError(e, error) })
    throw new Error(error)
  }
}

export const storeSecurelyWithReportableError = async (key: string, value: string, error: string) => {
  try {
    await SecureStore.setItemAsync(key, value, defaultSecureStoreConfig)
  } catch (e) {
    sendAnalytics('Error', { message: error })
    throw new Error(error)
  } finally {
    value = ''
  }
}

export const deleteSecurelyWithReportableError = async (key: string, error: string) => {
  try {
    await SecureStore.deleteItemAsync(key, defaultSecureStoreConfig)
  } catch (e) {
    sendAnalytics('Error', { message: error })
    throw new Error(error)
  }
}
