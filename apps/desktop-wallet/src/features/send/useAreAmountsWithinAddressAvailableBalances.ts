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

import { AddressHash } from '@alephium/shared'

import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import { AssetAmountInputType } from '@/types/assets'

const useAreAmountsWithinAddressAvailableBalances = (
  addressHash: AddressHash,
  amounts: AssetAmountInputType[]
): boolean => {
  const amountsWithBalance = amounts.filter(({ amount }) => !!amount)
  const { data: addressTokensBalances } = useFetchAddressBalances({
    addressHash,
    skip: amountsWithBalance.length === 0
  })

  return amountsWithBalance.every(({ id, amount }) => {
    const balances = addressTokensBalances.find((token) => token.id === id)

    return !amount ? true : !balances ? false : amount <= BigInt(balances.availableBalance)
  })
}

export default useAreAmountsWithinAddressAvailableBalances
