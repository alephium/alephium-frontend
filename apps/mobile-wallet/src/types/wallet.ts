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

import { NonSensitiveAddressData } from '@alephium/keyring'
import { AddressMetadata, Contact, ContactFormData } from '@alephium/shared'

import { AddressPartial } from '~/types/addresses'

export type WalletMetadata = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadata[]
  contacts: Contact[]
}

export interface WalletState {
  id: string
  name: string
  isUnlocked: boolean
  isMnemonicBackedUp?: boolean
}

export interface StoredWallet {
  id: string
  name: string
  mnemonic: string
  isMnemonicBackedUp?: boolean
}

export type GeneratedWallet = StoredWallet & { firstAddress: NonSensitiveAddressData }

export type WalletImportData = {
  mnemonic: string
  addresses: AddressMetadata[]
  contacts: ContactFormData[]
}

export type ImportedWalletWithMetadata = StoredWallet & WalletImportData

export interface CredentialsState {
  pin?: string
}

export type WalletUnlockedPayload = CredentialsState & {
  wallet: WalletState
  addressesToInitialize: AddressPartial[]
  contacts: Contact[]
}
