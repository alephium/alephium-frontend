import { EncryptedMnemonicVersion, keyring, NonSensitiveAddressData } from '@alephium/keyring'
import {
  GROUPLESS_ADDRESS_KEY_TYPE,
  hiddenTokensLoadedFromStorage,
  newAddressesSaved,
  passphraseInitialAddressGenerated,
  throttledClient,
  walletLocked,
  walletSwitchedDesktop,
  walletUnlockedDesktop
} from '@alephium/shared'
import { getPersisterKey, useCurrentlyOnlineNetworkId, usePersistQueryClientContext } from '@alephium/shared-react'
import { sleep } from '@alephium/web3'
import { useCallback } from 'react'

import useAnalytics from '@/features/analytics/useAnalytics'
import { hiddenTokensStorage } from '@/features/hiddenTokens/hiddenTokensPersistentStorage'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { toggleAppLoading, userDataMigrationFailed } from '@/storage/global/globalActions'
import { persisterExists } from '@/storage/tanstackQueryCache/tanstackIndexedDBPersister'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'
import { migrateUserData } from '@/utils/migration'

interface UnlockWalletProps {
  event: 'unlock' | 'switch'
  walletId: string
  password: string
  afterUnlock: () => void
  passphrase?: string
}

const useWalletLock = () => {
  const { restoreAddressesFromMetadata } = useAddressGeneration()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const { restoreQueryCache, clearQueryCache, persistQueryCache } = usePersistQueryClientContext()
  const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const isActiveWalletPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)

  const lockWallet = useCallback(
    async (lockedFrom?: string) => {
      keyring.clear()

      if (activeWalletId && !isActiveWalletPassphraseUsed) {
        await persistQueryCache(activeWalletId)
      }

      dispatch(walletLocked())

      if (lockedFrom) sendAnalytics({ event: 'Locked wallet', props: { origin: lockedFrom } })
    },
    [activeWalletId, isActiveWalletPassphraseUsed, dispatch, sendAnalytics, persistQueryCache]
  )

  const unlockWallet = async (props: UnlockWalletProps | null) => {
    if (!props) return

    const { event, walletId, afterUnlock } = props
    let { password, passphrase } = props
    let encryptedWallet: StoredEncryptedWallet | null
    let initialAddress: NonSensitiveAddressData
    let version: EncryptedMnemonicVersion
    const isPassphraseUsed = !!passphrase

    try {
      encryptedWallet = walletStorage.load(walletId)
      version = await keyring.initFromEncryptedMnemonic(encryptedWallet.encrypted, password, passphrase ?? '')
    } catch (e) {
      console.error(e)
      dispatch(passwordValidationFailed())
      return
    }

    dispatch(toggleAppLoading(true))

    try {
      await migrateUserData(encryptedWallet.id, password, version)
    } catch {
      sendAnalytics({ type: 'error', message: 'User data migration failed' })
      dispatch(userDataMigrationFailed())
    }

    try {
      const hiddenTokens = hiddenTokensStorage.load(encryptedWallet.id)
      dispatch(hiddenTokensLoadedFromStorage(hiddenTokens))
    } catch {
      sendAnalytics({ type: 'error', message: 'Loading hidden assets failed' })
    }

    const wallet = {
      id: encryptedWallet.id,
      name: encryptedWallet.name,
      isPassphraseUsed,
      isLedger: false
    }

    if (activeWalletId && !isActiveWalletPassphraseUsed) {
      await persistQueryCache(activeWalletId)
    }

    clearQueryCache()

    if (await persisterExists(getPersisterKey(encryptedWallet.id))) {
      await restoreQueryCache(encryptedWallet.id, isPassphraseUsed)
    }

    if (!isPassphraseUsed) {
      await restoreAddressesFromMetadata({ walletId: encryptedWallet.id, isPassphraseUsed, isLedger: false })

      walletStorage.update(walletId, { lastUsed: Date.now() })

      sendAnalytics({
        event: event === 'unlock' ? 'Wallet unlocked' : 'Wallet switched',
        props: {
          wallet_name_length: encryptedWallet.name.length,
          number_of_addresses: (addressMetadataStorage.load(encryptedWallet.id) as []).length,
          number_of_contacts: (contactsStorage.load(encryptedWallet.id) as []).length
        }
      })
    } else {
      const initialOldAddress = keyring.generateAndCacheAddress({ addressIndex: 0, keyType: 'default' })
      let isOldAddressActive = false

      if (currentlyOnlineNetworkId !== undefined) {
        const response = await throttledClient.explorer.addresses.postAddressesUsed([initialOldAddress.hash])
        isOldAddressActive = response[0]
      }

      try {
        initialAddress = keyring.generateAndCacheAddress({ addressIndex: 0, keyType: GROUPLESS_ADDRESS_KEY_TYPE })
      } catch (e) {
        console.error(e)
        return
      }

      const address = { ...initialAddress, ...getInitialAddressSettings() }
      dispatch(passphraseInitialAddressGenerated(address))

      if (currentlyOnlineNetworkId === undefined || isOldAddressActive) {
        dispatch(
          newAddressesSaved([
            {
              ...initialOldAddress,
              isDefault: false,
              color: getRandomLabelColor()
            }
          ])
        )
      }
    }

    dispatch(event === 'unlock' ? walletUnlockedDesktop(wallet) : walletSwitchedDesktop(wallet))

    afterUnlock()

    // Navigating to the Overview screen freezes the app. This is because the React components need some time to load.
    // We could use Suspence to display some placeholder content until all components of the Overview page have been
    // rendered instead of freezing the app. For now, by delaying the hiding of the loader, we achieve a similar effect.
    sleep(2000).then(() => dispatch(toggleAppLoading(false)))

    encryptedWallet = null
    passphrase = ''
    password = ''
    props = null
  }

  return {
    lockWallet,
    unlockWallet
  }
}

export default useWalletLock
