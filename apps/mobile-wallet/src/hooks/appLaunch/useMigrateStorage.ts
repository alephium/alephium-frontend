import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { hasMigratedFromAsyncStorage, migrateFromAsyncStorage } from '~/persistent-storage/storage'

const useMigrateStorage = () => {
  const [hasMigrated, setHasMigrated] = useState(hasMigratedFromAsyncStorage)

  useEffect(() => {
    if (!hasMigratedFromAsyncStorage) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await migrateFromAsyncStorage()
        } catch (e) {
          sendAnalytics({
            type: 'error',
            message: 'Failed to migrate from AsyncStorage to MMKV',
            error: e
          })
        }

        setHasMigrated(true)
      })
    }
  }, [])

  return hasMigrated
}

export default useMigrateStorage
