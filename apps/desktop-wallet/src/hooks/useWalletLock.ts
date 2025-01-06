import { EncryptedMnemonicVersion, keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { useCallback } from 'react'

import { usePersistQueryClientContext } from '@/api/persistQueryClientContext'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { toggleAppLoading, userDataMigrationFailed } from '@/storage/global/globalActions'
import { walletLocked, walletSwitched, walletUnlocked } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'
import { migrateUserData } from '@/utils/migration'

interface UnlockWalletProps {
  event: 'unlock' | 'switch'
  walletId: string
  password: string
  afterUnlock: () => void
  passphrase?: string
}

const useWalletLock = () => {
  const isWalletUnlocked = useAppSelector((s) => !!s.activeWallet.id)
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
      initialAddress = keyring.generateAndCacheAddress({ addressIndex: 0 })
    } catch (e) {
      console.error(e)
      return
    }

    const payload = {
      wallet: {
        id: encryptedWallet.id,
        name: encryptedWallet.name,
        isPassphraseUsed,
        isLedger: false
      },
      initialAddress
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
    }

    dispatch(event === 'unlock' ? walletUnlocked(payload) : walletSwitched(payload))

    dispatch(toggleAppLoading(false))

    afterUnlock()

    encryptedWallet = null
    passphrase = ''
    password = ''
    props = null
  }

  return {
    isWalletUnlocked,
    lockWallet,
    unlockWallet
  }
}

export default useWalletLock
