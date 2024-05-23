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

import { GeneratedWallet, WalletMetadata, WalletState } from '~/types/wallet'

export const walletUnlocked = createAction<WalletMetadata>('wallets/walletUnlocked')

export const newWalletGenerated = createAction<GeneratedWallet>('wallets/newWalletGenerated')

export const newWalletImportedWithMetadata = createAction<GeneratedWallet>('wallets/newWalletImportedWithMetadata')

export const walletDeleted = createAction('wallets/walletDeleted')

export const walletNameChanged = createAction<WalletState['name']>('wallets/walletNameChanged')
