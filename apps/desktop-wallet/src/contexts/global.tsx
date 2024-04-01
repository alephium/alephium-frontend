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

import { EncryptedMnemonicVersion, keyring, NonSensitiveAddressData } from '@alephium/shared-crypto'
import { merge } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { PartialDeep } from 'type-fest'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import useIdleForTooLong from '@/hooks/useIdleForTooLong'
import useLatestGitHubRelease from '@/hooks/useLatestGitHubRelease'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { osThemeChangeDetected, userDataMigrationFailed } from '@/storage/global/globalActions'
import { walletLocked, walletSwitched, walletUnlocked } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { StoredEncryptedWallet } from '@/types/wallet'
import { AlephiumWindow } from '@/types/window'
import { migrateUserData } from '@/utils/migration'

interface WalletUnlockProps {
  event: 'unlock' | 'switch'
  walletId: string
  password: string
  afterUnlock: () => void
  passphrase?: string
}

export interface GlobalContextProps {
  unlockWallet: (props: WalletUnlockProps) => void
  newVersion: string
  requiresManualDownload: boolean
  newVersionDownloadTriggered: boolean
  triggerNewVersionDownload: () => void
  resetNewVersionDownloadTrigger: () => void
}

export const initialGlobalContext: GlobalContextProps = {
  unlockWallet: () => null,
  newVersion: '',
  requiresManualDownload: false,
  newVersionDownloadTriggered: false,
  triggerNewVersionDownload: () => null,
  resetNewVersionDownloadTrigger: () => null
}

export const GlobalContext = createContext<GlobalContextProps>(initialGlobalContext)

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const GlobalContextProvider: FC<{ overrideContextValue?: PartialDeep<GlobalContextProps> }> = ({
  children,
  overrideContextValue
}) => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings)
  const { restoreAddressesFromMetadata } = useAddressGeneration()
  const posthog = usePostHog()

  const { newVersion, requiresManualDownload } = useLatestGitHubRelease()
  const [newVersionDownloadTriggered, setNewVersionDownloadTriggered] = useState(false)

  const triggerNewVersionDownload = () => setNewVersionDownloadTriggered(true)
  const resetNewVersionDownloadTrigger = () => setNewVersionDownloadTriggered(false)

  const unlockWallet = async (props: WalletUnlockProps | null) => {
    if (!props) return

    const { event, walletId, afterUnlock } = props
    let { password, passphrase } = props
    let encryptedWallet: StoredEncryptedWallet | null
    let initialAddress: NonSensitiveAddressData
    let version: EncryptedMnemonicVersion

    try {
      encryptedWallet = walletStorage.load(walletId)
      version = keyring.initFromEncryptedMnemonic(encryptedWallet.encrypted, password, passphrase ?? '')
    } catch (e) {
      console.error(e)
      dispatch(passwordValidationFailed())
      return
    }

    try {
      migrateUserData(encryptedWallet.id, password, version)
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'User data migration failed ' })
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
        isPassphraseUsed: !!passphrase
      },
      initialAddress
    }

    dispatch(event === 'unlock' ? walletUnlocked(payload) : walletSwitched(payload))

    if (!passphrase) {
      restoreAddressesFromMetadata(encryptedWallet.id)

      walletStorage.update(walletId, { lastUsed: Date.now() })

      posthog.capture(event === 'unlock' ? 'Wallet unlocked' : 'Wallet switched', {
        wallet_name_length: encryptedWallet.name.length,
        number_of_addresses: (addressMetadataStorage.load(encryptedWallet.id) as []).length,
        number_of_contacts: (contactsStorage.load(encryptedWallet.id) as []).length
      })
    }

    afterUnlock()

    encryptedWallet = null
    passphrase = ''
    password = ''
    props = null
  }

  useIdleForTooLong(
    () => {
      keyring.clearCachedSecrets()
      dispatch(walletLocked())
    },
    (settings.walletLockTimeInMinutes || 0) * 60 * 1000
  )

  useEffect(() => {
    const shouldListenToOSThemeChanges = settings.theme === 'system'

    if (!shouldListenToOSThemeChanges) return

    const removeOSThemeChangeListener = electron?.theme.onShouldUseDarkColors((useDark: boolean) =>
      dispatch(osThemeChangeDetected(useDark ? 'dark' : 'light'))
    )

    const removeGetNativeThemeListener = electron?.theme.onGetNativeTheme((nativeTheme) =>
      dispatch(osThemeChangeDetected(nativeTheme.shouldUseDarkColors ? 'dark' : 'light'))
    )

    electron?.theme.getNativeTheme()

    return () => {
      removeGetNativeThemeListener && removeGetNativeThemeListener()
      removeOSThemeChangeListener && removeOSThemeChangeListener()
    }
  }, [dispatch, settings.theme])

  return (
    <GlobalContext.Provider
      value={merge(
        {
          unlockWallet,
          newVersion,
          requiresManualDownload,
          newVersionDownloadTriggered,
          triggerNewVersionDownload,
          resetNewVersionDownloadTrigger
        },
        overrideContextValue as GlobalContextProps
      )}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
