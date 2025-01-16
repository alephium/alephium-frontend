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

export const getSecurelyWithReportableError = async (
  key: string,
  showDefaultErrorMessage: boolean,
  errorMessage: string
) => {
  try {
    return await SecureStore.getItemAsync(key, defaultSecureStoreConfig)
  } catch (error) {
    sendAnalytics({
      type: 'error',
      message: showDefaultErrorMessage ? `Could not get ${key} from secure storage` : errorMessage
    })
    throw error
  }
}

export const storeSecurelyWithReportableError = async (
  key: string,
  value: string,
  showDefaultErrorMessage: boolean,
  errorMessage: string
) => {
  try {
    await SecureStore.setItemAsync(key, value, defaultSecureStoreConfig)
  } catch (error) {
    sendAnalytics({
      type: 'error',
      message: showDefaultErrorMessage ? `Could not store ${key} in secure storage` : errorMessage
    })
    throw error
  } finally {
    value = ''
  }
}

export const deleteSecurelyWithReportableError = async (
  key: string,
  showDefaultErrorMessage: boolean,
  errorMessage: string
) => {
  try {
    await SecureStore.deleteItemAsync(key, defaultSecureStoreConfig)
  } catch (error) {
    sendAnalytics({
      type: 'error',
      message: showDefaultErrorMessage ? `Could not delete ${key} from secure storage` : errorMessage
    })
    throw error
  }
}
