import { createAction } from '@reduxjs/toolkit'

import { Message } from '@/types/snackbar'
import { GeneratedWallet, StoredEncryptedWallet, UnlockedWallet } from '@/types/wallet'

export const walletCreationFailed = createAction<Message>('wallets/walletCreationFailed')

export const walletNameStorageFailed = createAction<Message>('wallets/walletNameStorageFailed')

export const walletDeleted = createAction<StoredEncryptedWallet['id']>('wallets/walletDeleted')

export const walletSaved = createAction<GeneratedWallet>('wallets/walletSaved')

export const walletLocked = createAction('wallets/walletLocked')

export const walletUnlocked = createAction<UnlockedWallet>('wallets/walletUnlocked')

export const walletSwitched = createAction<UnlockedWallet>('wallets/walletSwitched')

export const activeWalletDeleted = createAction('wallets/activeWalletDeleted')

export const newWalletNameStored = createAction<StoredEncryptedWallet['name']>('wallets/newWalletNameStored')
