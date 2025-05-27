import AsyncStorage from '@react-native-async-storage/async-storage'
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV({ id: 'mmkv.alephium-mobile-wallet' })

// TODO: Delete after everyone has migrated to MMKV
export const hasMigratedFromAsyncStorage = storage.getBoolean('hasMigratedFromAsyncStorage')

// TODO: Delete after everyone has migrated to MMKV
export async function migrateFromAsyncStorage(): Promise<void> {
  console.log('Migrating from AsyncStorage -> MMKV...')
  const start = global.performance.now()

  const keys = await AsyncStorage.getAllKeys()

  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key)

      if (value != null) {
        if (['true', 'false'].includes(value)) {
          storage.set(key, value === 'true')
        } else {
          storage.set(key, value)
        }

        // TODO: We should delete the AsyncStorage data but for now we are keeping it in case something goes wrong
        // to prevent data loss.
        // AsyncStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Failed to migrate key "${key}" from AsyncStorage to MMKV!`, error)
      throw error
    }
  }

  storage.set('hasMigratedFromAsyncStorage', true)

  const end = global.performance.now()
  console.log(`Migrated from AsyncStorage -> MMKV in ${end - start}ms!`)
}
