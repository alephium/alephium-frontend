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
import { useMemo } from 'react'

import useAddressesTokensWorth from '@/api/apiDataHooks/useAddressesTokensWorth'

// TODO: Delete in favor of new hooks
const useAddressesTokensWorthTotal = (addressHash?: AddressHash) => {
  const { data: tokensWorth, isLoading } = useAddressesTokensWorth(addressHash)

  const totalTokensWorth = useMemo(
    () => Object.values(tokensWorth).reduce((acc, tokenWorth) => (tokenWorth ?? 0) + (acc ?? 0), 0),
    [tokensWorth]
  )

  return {
    data: totalTokensWorth,
    isLoading
  }
}

export default useAddressesTokensWorthTotal
