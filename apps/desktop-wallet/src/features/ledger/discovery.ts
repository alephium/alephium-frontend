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

import { NonSensitiveAddressDataWithGroup } from '@alephium/keyring'
import { findNextAvailableAddressIndex, throttledClient } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'

const minGap = 5
const derivationBatchSize = 10

// Copied from extension wallet
class DerivedAccountsPerGroup {
  addresses: NonSensitiveAddressDataWithGroup[]
  gap: number

  constructor() {
    this.addresses = []
    this.gap = 0
  }

  addAddress(account: NonSensitiveAddressDataWithGroup, active: boolean) {
    if (!this.isComplete()) {
      if (!active) {
        this.gap += 1
      } else {
        this.gap = 0
        this.addresses.push(account)
      }
    }
  }

  isComplete(): boolean {
    return this.gap >= minGap
  }
}

// Copied from extension wallet
export abstract class AccountDiscovery {
  public async deriveActiveAccounts(
    deriveAccount: (startIndex: number) => Promise<NonSensitiveAddressDataWithGroup>,
    skipIndexes: number[] = []
  ): Promise<NonSensitiveAddressDataWithGroup[]> {
    const allAddresses = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map(() => new DerivedAccountsPerGroup())

    const initialAddressIndex = 0

    let nextAddressIndex = skipIndexes.includes(initialAddressIndex)
      ? findNextAvailableAddressIndex(initialAddressIndex, skipIndexes)
      : initialAddressIndex

    while (allAddresses.some((a) => !a.isComplete())) {
      const newWalletAccounts = []
      for (let i = 0; i < derivationBatchSize; i++) {
        const newWalletAccount = await deriveAccount(nextAddressIndex)
        newWalletAccounts.push(newWalletAccount)
        nextAddressIndex = findNextAvailableAddressIndex(nextAddressIndex, skipIndexes)
      }
      const results = await throttledClient.explorer.addresses.postAddressesUsed(
        newWalletAccounts.map((address) => address.hash)
      )
      newWalletAccounts.forEach((address, index) => {
        const accountsPerGroup = allAddresses[address.group]
        accountsPerGroup.addAddress(address, results[index])
      })
    }
    return allAddresses.flatMap((a) => a.addresses)
  }
}
