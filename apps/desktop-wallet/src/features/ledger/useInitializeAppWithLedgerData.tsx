import { NonSensitiveAddressData } from '@alephium/keyring'
import { walletUnlockedDesktop } from '@alephium/shared'
import { getPersisterKey, usePersistQueryClientContext } from '@alephium/shared-react'
import { useNavigate } from 'react-router-dom'

import { newLedgerDeviceConnected } from '@/features/ledger/ledgerActions'
import { generateUuidFromInitialAddress } from '@/features/ledger/utils'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { persisterExists } from '@/storage/tanstackQueryCache/tanstackIndexedDBPersister'

const useInitializeAppWithLedgerData = () => {
  const dispatch = useAppDispatch()
  const { restoreQueryCache } = usePersistQueryClientContext()
  const navigate = useNavigate()
  const { restoreAddressesFromMetadata } = useAddressGeneration()

  const initializeAppWithLedgerData = async (deviceModel: string, initialAddress: NonSensitiveAddressData) => {
    const walletId = await generateUuidFromInitialAddress(initialAddress.hash)

    if (addressMetadataStorage.load(walletId).length === 0) {
      dispatch(newLedgerDeviceConnected())
    }

    if (await persisterExists(getPersisterKey(walletId))) {
      await restoreQueryCache(walletId)
    }
    await restoreAddressesFromMetadata({ walletId, isPassphraseUsed: false, isLedger: true })

    dispatch(
      walletUnlockedDesktop({
        id: walletId,
        name: deviceModel,
        isPassphraseUsed: false,
        isLedger: true
      })
    )

    navigate('/wallet/overview')
  }

  return initializeAppWithLedgerData
}

export default useInitializeAppWithLedgerData
