import { queryClient, usePersistQueryClientContext } from '@alephium/shared-react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button } from 'react-native'

import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import { storage } from '~/persistent-storage/storage'

const SettingsDevSection = () => {
  const { deletePersistedCache } = usePersistQueryClientContext()
  const walletId = useAppSelector((s) => s.wallet.id)

  const deleteTanstackQueryCache = () => {
    queryClient.clear()
    deletePersistedCache(walletId)
  }

  return (
    <ScreenSection>
      <ScreenSectionTitle>DEV</ScreenSectionTitle>

      <Row title="Print AsyncStorage contents to console">
        <Button title="Print" onPress={printAsyncStorageContentsToConsole} />
      </Row>

      <Row title="Print MMKV contents to console">
        <Button title="Print" onPress={printMMKVContentsToConsole} />
      </Row>

      <Row title="Delete Tanstack query cache from storage">
        <Button title="Delete" onPress={deleteTanstackQueryCache} />
      </Row>
    </ScreenSection>
  )
}

export default SettingsDevSection

const printAsyncStorageContentsToConsole = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const stores = await AsyncStorage.multiGet(keys)

  console.log('--------------ASYNC STORAGE CONTENTS START------------------')
  stores.forEach(([key, value]) => {
    console.log(`${key}: ${value}`)
    console.log('--------------------------------')
  })
  console.log('-------------ASYNC STORAGE CONTENTS END-------------------')
}

const printMMKVContentsToConsole = () => {
  console.log('--------------MMKV CONTENTS START------------------')
  console.log(storage.getAllKeys())
  console.log('--------------MMKV CONTENTS END--------------------')
}
