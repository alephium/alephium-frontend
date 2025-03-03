import * as SecureStore from 'expo-secure-store'

export const defaultSecureStoreConfig = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  keychainService: 'mobile-wallet-key-service'
}

export const defaultBiometricsConfig = {
  ...defaultSecureStoreConfig,
  requireAuthentication: true,
  authenticationPrompt: 'Please authenticate'
}
