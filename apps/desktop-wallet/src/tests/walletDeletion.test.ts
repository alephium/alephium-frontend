vi.mock('@alephium/web3-wallet', () => ({}))

import { keyring } from '@alephium/keyring'
import { AnalyticsEvent } from '@alephium/shared'
import {
  activeWalletDeleted,
  contactStoredInPersistentStorage,
  transactionSent,
  walletLocked,
  walletUnlockedDesktop
} from '@alephium/shared/store'
import type { Contact, SentTransaction } from '@alephium/shared/types'
import type { PersistQueryClientContextType } from '@alephium/shared-react'
import type { Mock } from 'vitest'

import type useAnalytics from '@/features/analytics/useAnalytics'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { store } from '@/storage/store'
import { walletDeleted, walletSaved } from '@/storage/wallets/walletActions'
import { deleteWallet } from '@/storage/wallets/walletDeletion'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

type DeletePersistedCache = PersistQueryClientContextType['deletePersistedCache']
type SendAnalytics = ReturnType<typeof useAnalytics>['sendAnalytics']

const testMnemonic =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'

const contact: Contact = { id: 'c1', name: 'Bob', address: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH' }

const sentTx: SentTransaction = {
  hash: 'tx1',
  fromAddress: '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
  toAddress: '1TrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
  timestamp: 1,
  type: 'transfer',
  status: 'sent'
}

let deletePersistedCache: Mock<DeletePersistedCache>
let sendAnalytics: Mock<SendAnalytics>

const seedWallet = (name: string) => {
  const wallet = walletStorage.store(name, `encrypted-${name}`)

  addressMetadataStorage.store(wallet.id, [{ index: 0, keyType: 'default', isDefault: true, color: 'blue' }])
  store.dispatch(walletSaved(wallet))

  return wallet
}

const makeActive = (walletId: string, name: string) =>
  store.dispatch(walletUnlockedDesktop({ id: walletId, name, isPassphraseUsed: false, isLedger: false }))

const runDeleteWallet = (walletId: string, activeWalletId: string | undefined) =>
  deleteWallet({ walletId, activeWalletId, dispatch: store.dispatch, deletePersistedCache, sendAnalytics })

beforeEach(() => {
  localStorage.clear()
  keyring.clear()
  store.dispatch(walletLocked())
  deletePersistedCache = vi.fn<DeletePersistedCache>()
  sendAnalytics = vi.fn<SendAnalytics>()
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  keyring.clear()
  store.dispatch(walletLocked())
})

describe('deleteWallet', () => {
  describe('when the deleted wallet is not the active one', () => {
    it('removes only the deleted wallet localStorage keys and keeps the other wallet keys', () => {
      const active = seedWallet('Wallet A')
      const other = seedWallet('Wallet B')
      makeActive(active.id, active.name)

      runDeleteWallet(other.id, active.id)

      expect(localStorage.getItem(`wallet-${other.id}`)).toBeNull()
      expect(localStorage.getItem(`addresses-metadata-${other.id}`)).toBeNull()
      expect(localStorage.getItem(`wallet-${active.id}`)).not.toBeNull()
      expect(localStorage.getItem(`addresses-metadata-${active.id}`)).not.toBeNull()
    })

    it('does not clear the keyring', () => {
      const active = seedWallet('Wallet A')
      const other = seedWallet('Wallet B')
      makeActive(active.id, active.name)
      keyring.importMnemonicString(testMnemonic)
      const clearSpy = vi.spyOn(keyring, 'clear')

      runDeleteWallet(other.id, active.id)

      expect(clearSpy).not.toHaveBeenCalled()
      expect(keyring.isInitialized()).toBe(true)
    })

    it('dispatches walletDeleted, removing it from global.wallets while leaving the active wallet and contacts untouched', () => {
      const active = seedWallet('Wallet A')
      const other = seedWallet('Wallet B')
      makeActive(active.id, active.name)
      store.dispatch(contactStoredInPersistentStorage(contact))
      const dispatchSpy = vi.spyOn(store, 'dispatch')

      runDeleteWallet(other.id, active.id)

      expect(dispatchSpy).toHaveBeenCalledWith(walletDeleted(other.id))

      const state = store.getState()
      expect(state.global.wallets.map((wallet) => wallet.id)).toEqual([active.id])
      expect(state.activeWallet.id).toBe(active.id)
      expect(state.contacts.ids).toContain('c1')
    })
  })

  describe('when the deleted wallet is the active one', () => {
    it('clears the keyring', () => {
      const active = seedWallet('Wallet A')
      seedWallet('Wallet B')
      makeActive(active.id, active.name)
      keyring.importMnemonicString(testMnemonic)
      const clearSpy = vi.spyOn(keyring, 'clear')

      runDeleteWallet(active.id, active.id)

      expect(clearSpy).toHaveBeenCalledTimes(1)
      expect(keyring.isInitialized()).toBe(false)
    })

    it('dispatches activeWalletDeleted, resetting the active wallet, contacts and sent transactions and re-listing global.wallets without the deleted wallet', () => {
      const active = seedWallet('Wallet A')
      const other = seedWallet('Wallet B')
      makeActive(active.id, active.name)
      store.dispatch(contactStoredInPersistentStorage(contact))
      store.dispatch(transactionSent(sentTx))
      const dispatchSpy = vi.spyOn(store, 'dispatch')

      runDeleteWallet(active.id, active.id)

      expect(dispatchSpy).toHaveBeenCalledWith(activeWalletDeleted())

      const state = store.getState()
      expect(state.activeWallet.id).toBeUndefined()
      expect(state.contacts.ids).toHaveLength(0)
      expect(state.sentTransactions.ids).toHaveLength(0)
      expect(state.global.wallets.map((wallet) => wallet.id)).toEqual([other.id])
    })

    it('removes its localStorage keys and deletes its persisted query cache', () => {
      const active = seedWallet('Wallet A')
      seedWallet('Wallet B')
      makeActive(active.id, active.name)

      runDeleteWallet(active.id, active.id)

      expect(localStorage.getItem(`wallet-${active.id}`)).toBeNull()
      expect(localStorage.getItem(`addresses-metadata-${active.id}`)).toBeNull()
      expect(deletePersistedCache).toHaveBeenCalledWith(active.id)
    })
  })

  it('leaves no wallets in storage or in global.wallets when the last wallet is deleted', () => {
    const active = seedWallet('Wallet A')
    makeActive(active.id, active.name)

    runDeleteWallet(active.id, active.id)

    expect(walletStorage.list()).toHaveLength(0)
    expect(store.getState().global.wallets).toHaveLength(0)
  })

  it('does not throw when the wallet storage keys are already absent', () => {
    expect(() => runDeleteWallet('non-existent-wallet-id', undefined)).not.toThrow()
  })

  it('sends the DELETED_WALLET analytics event', () => {
    const active = seedWallet('Wallet A')
    const other = seedWallet('Wallet B')
    makeActive(active.id, active.name)

    runDeleteWallet(other.id, active.id)

    expect(sendAnalytics).toHaveBeenCalledWith({ event: AnalyticsEvent.DELETED_WALLET })
  })
})
