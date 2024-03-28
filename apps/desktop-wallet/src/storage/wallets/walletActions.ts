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
