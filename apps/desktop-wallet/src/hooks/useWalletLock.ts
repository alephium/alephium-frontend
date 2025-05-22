import { EncryptedMnemonicVersion, keyring, NonSensitiveAddressData } from '@alephium/keyring'
import {
  hiddenTokensLoadedFromStorage,
  passphraseInitialAddressGenerated,
  walletLocked,
  walletSwitchedDesktop,
  walletUnlockedDesktop
} from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { sleep } from '@alephium/web3'
import { useCallback } from 'react'

import useAnalytics from '@/features/analytics/useAnalytics'
import { hiddenTokensStorage } from '@/features/hiddenTokens/hiddenTokensPersistentStorage'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { toggleAppLoading, userDataMigrationFailed } from '@/storage/global/globalActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'
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
  const { restoreQueryCache, clearQueryCache } = usePersistQueryClientContext()

  const lockWallet = useCallback(
    (lockedFrom?: string) => {
      keyring.clear()

      clearQueryCache()

      dispatch(walletLocked())

      if (lockedFrom) sendAnalytics({ event: 'Locked wallet', props: { origin: lockedFrom } })
    },
    [dispatch, sendAnalytics, clearQueryCache]
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

    try {
      // TODO: This is used only for passphrase. What do we do when unlocking a passphrase wallet after Danube?
      // Do we generate a groupless address at index 0? What if the user had their funds in index 0 of default keyType?
      // Do we do address discovery?
      initialAddress = keyring.generateAndCacheAddress({ addressIndex: 0, keyType: 'default' })
    } catch (e) {
      console.error(e)
      return
    }

    const wallet = {
      id: encryptedWallet.id,
      name: encryptedWallet.name,
      isPassphraseUsed,
      isLedger: false
    }

    clearQueryCache()
    await restoreQueryCache(encryptedWallet.id, isPassphraseUsed)

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
      const address = { ...initialAddress, ...getInitialAddressSettings() }
      dispatch(passphraseInitialAddressGenerated(address))
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
