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

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchToken, { isNFT } from '@/api/apiDataHooks/tokens/useFetchToken'
import SelectOptionToken, { SelectOptionTokenBaseProps } from '@/components/Inputs/SelectOptionToken'

interface SelectOptionAddressTokenProps extends SelectOptionTokenBaseProps {
  addressHash: AddressHash
}

const SelectOptionAddressToken = ({ tokenId, addressHash, ...props }: SelectOptionAddressTokenProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchAddressSingleTokenBalances({
    addressHash,
    tokenId,
    skip: isLoadingToken || isNFT(token)
  })

  return (
    <SelectOptionToken
      tokenId={tokenId}
      amount={tokenBalances?.totalBalance}
      showAmount={!isNFT(token)}
      isLoading={isLoadingTokenBalances}
      {...props}
    />
  )
}

export default SelectOptionAddressToken
