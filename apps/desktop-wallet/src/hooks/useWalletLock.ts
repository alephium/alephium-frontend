/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { EncryptedMnemonicVersion, keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { useCallback } from 'react'

import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { userDataMigrationFailed } from '@/storage/global/globalActions'
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

  const lockWallet = useCallback(
    (lockedFrom?: string) => {
      keyring.clearAll()
      dispatch(walletLocked())

      if (lockedFrom) sendAnalytics({ event: 'Locked wallet', props: { origin: lockedFrom } })
    },
    [dispatch, sendAnalytics]
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
        isPassphraseUsed
      },
      initialAddress
    }

    dispatch(event === 'unlock' ? walletUnlocked(payload) : walletSwitched(payload))

    if (!isPassphraseUsed) {
      restoreAddressesFromMetadata(encryptedWallet.id, isPassphraseUsed)

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
