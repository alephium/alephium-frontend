import { NonSensitiveAddressData } from '@alephium/keyring'
import { useNavigate } from 'react-router-dom'

import { usePersistQueryClientContext } from '@/api/persistQueryClientContext'
import { newLedgerDeviceConnected } from '@/features/ledger/ledgerActions'
import { generateUuidFromInitialAddress } from '@/features/ledger/utils'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { walletUnlocked } from '@/storage/wallets/walletActions'

const useInitializeAppWithLedgerData = () => {
  const dispatch = useAppDispatch()
  const { restoreQueryCache, clearQueryCache } = usePersistQueryClientContext()
  const navigate = useNavigate()
  const { restoreAddressesFromMetadata } = useAddressGeneration()

  const initializeAppWithLedgerData = async (deviceModel: string, initialAddress: NonSensitiveAddressData) => {
    clearQueryCache()

    const walletId = await generateUuidFromInitialAddress(initialAddress.hash)

    if (addressMetadataStorage.load(walletId).length === 0) {
      dispatch(newLedgerDeviceConnected())
    }

    await restoreQueryCache(walletId)
    await restoreAddressesFromMetadata({ walletId, isPassphraseUsed: false, isLedger: true })

    dispatch(
      walletUnlocked({
        wallet: {
          id: walletId,
          name: deviceModel,
          isPassphraseUsed: false,
          isLedger: true
        },
        initialAddress
      })
    )

    navigate('/wallet/overview')
  }

  return initializeAppWithLedgerData
}

export default useInitializeAppWithLedgerData
