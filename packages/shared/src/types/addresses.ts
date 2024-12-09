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

import { explorer as e, Optional } from '@alephium/web3'

import { StringAlias } from '@/types/utils'

export type Contact = {
  id: string
  name: string
  address: AddressHash
}

export type ContactFormData = Optional<Contact, 'id'>

export type AddressHash = string & StringAlias

export type AddressSettings = {
  isDefault: boolean
  color: string
  label?: string
}

export type AddressIndex = number

export type AddressMetadata = AddressSettings & {
  index: AddressIndex
}

export type AddressBalancesSyncResult = Omit<e.AddressInfo, 'txNumber'> & {
  hash: AddressHash
}

export type AddressTokensSyncResult = {
  hash: AddressHash
  tokenBalances: e.AddressTokenBalance[]
}

export type BalanceHistory = {
  date: string // CHART_DATE_FORMAT
  balance: string
}
