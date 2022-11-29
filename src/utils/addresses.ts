/*
Copyright 2018 - 2022 The Alephium Authors
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

import * as Clipboard from 'expo-clipboard'
import Toast from 'react-native-root-toast'

import client from '../api/client'
import { Address } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

export const getAddressDisplayName = (address: Address): string =>
  address.settings.label || address.hash.substring(0, 6)

export const copyAddressToClipboard = (addressHash: AddressHash) => {
  Clipboard.setString(addressHash)
  Toast.show('Address copied!')
}

export const fetchAddressesData = async (addressHashes: AddressHash[]) => {
  const results = []

  for (const addressHash of addressHashes) {
    console.log('⬇️ Fetching address details: ', addressHash)
    const { data } = await client.explorerClient.getAddressDetails(addressHash)
    const availableBalance = data.balance
      ? data.lockedBalance
        ? (BigInt(data.balance) - BigInt(data.lockedBalance)).toString()
        : data.balance
      : undefined

    console.log('⬇️ Fetching 1st page of address confirmed transactions: ', addressHash)
    const { data: transactions } = await client.explorerClient.getAddressTransactions(addressHash, 1)

    console.log('⬇️ Fetching address tokens: ', addressHash)
    const { data: tokenIds } = await client.explorerClient.addresses.getAddressesAddressTokens(addressHash)

    const tokens = await Promise.all(
      tokenIds.map((id) =>
        client.explorerClient.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then(({ data }) => ({
          id,
          balances: data
        }))
      )
    )

    results.push({
      hash: addressHash,
      details: data,
      availableBalance: availableBalance,
      transactions,
      tokens
    })
  }

  return results
}
