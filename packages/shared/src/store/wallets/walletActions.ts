import { createAction } from '@reduxjs/toolkit'

import { AddressBase } from '@/types'
import { UnlockedWallet } from '@/types/wallets'

export const walletDeleted = createAction<string>('wallets/walletDeleted')

export const walletSaved = createAction<{ initialAddress: AddressBase }>('wallets/walletSaved')

export const walletLocked = createAction('wallets/walletLocked')

export const walletUnlocked = createAction<UnlockedWallet>('wallets/walletUnlocked')

export const walletSwitched = createAction<UnlockedWallet>('wallets/walletSwitched')

export const activeWalletDeleted = createAction('wallets/activeWalletDeleted')
