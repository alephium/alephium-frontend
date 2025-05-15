import { createAction } from '@reduxjs/toolkit'

import { Message } from '@/features/toastMessages/toastMessagesTypes'
import { GeneratedWallet, StoredEncryptedWallet } from '@/types/wallet'

export const walletCreationFailed = createAction<Message>('wallets/walletCreationFailed')

export const walletNameStorageFailed = createAction<Message>('wallets/walletNameStorageFailed')

export const walletDeleted = createAction<StoredEncryptedWallet['id']>('wallets/walletDeleted')

export const walletSaved = createAction<GeneratedWallet['wallet']>('wallets/walletSaved')

export const newWalletNameStored = createAction<StoredEncryptedWallet['name']>('wallets/newWalletNameStored')
