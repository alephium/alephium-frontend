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

import { AddressKeyPair } from '@alephium/shared'

import { AddressMetadata, AddressPartial } from '~/types/addresses'
import { Contact, ContactFormData } from '~/types/contacts'

export type Mnemonic = string

export type WalletMetadata = {
  id: string
  name: string
  isMnemonicBackedUp: boolean
  addresses: AddressMetadata[]
  contacts: Contact[]
}

export interface WalletState {
  name: string
  mnemonic: Mnemonic
  id: string
  isMnemonicBackedUp?: boolean
}

export type GeneratedWallet = WalletState & { firstAddress: AddressKeyPair }

export type WalletImportData = {
  mnemonic: Mnemonic
  addresses: AddressMetadata[]
  contacts: ContactFormData[]
}

export type ImportedWalletWithMetadata = WalletState & Omit<WalletImportData, 'mnemonic'>

export interface CredentialsState {
  pin?: string
}

export type WalletUnlockedPayload = CredentialsState & {
  wallet: WalletState
  addressesToInitialize: AddressPartial[]
  contacts: Contact[]
}
