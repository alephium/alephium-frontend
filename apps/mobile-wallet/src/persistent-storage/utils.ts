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

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

import { sendAnalytics } from '~/analytics'
import { defaultSecureStoreConfig } from '~/persistent-storage/config'

export const getWithReportableError = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: `Could not get ${key} from AsyncStorage` })
    throw error
  }
}

export const storeWithReportableError = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: `Could not store ${key} in AsyncStorage` })
    throw error
  }
}

export const deleteWithReportableError = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: `Could not delete ${key} from AsyncStorage` })
    throw error
  }
}

export const storeSecurelyWithReportableError = async (key: string, value: string, errorMessage: string) => {
  try {
    await SecureStore.setItemAsync(key, value, defaultSecureStoreConfig)
  } catch (error) {
    sendAnalytics({ type: 'error', message: errorMessage, isSensitive: true })
    throw error
  } finally {
    value = ''
  }
}

export const deleteSecurelyWithReportableError = async (key: string, errorMessage: string) => {
  try {
    await SecureStore.deleteItemAsync(key, defaultSecureStoreConfig)
  } catch (error) {
    sendAnalytics({ type: 'error', message: errorMessage })
    throw error
  }
}
