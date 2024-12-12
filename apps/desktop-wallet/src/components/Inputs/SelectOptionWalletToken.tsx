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

import useFetchToken, { isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import SelectOptionToken, { SelectOptionTokenBaseProps } from '@/components/Inputs/SelectOptionToken'

const SelectOptionWalletToken = ({ tokenId, ...props }: SelectOptionTokenBaseProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  const amount = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <SelectOptionToken
      tokenId={tokenId}
      amount={amount}
      showAmount={!isNFT(token)}
      isLoading={isLoadingTokenBalances}
      {...props}
    />
  )
}

export default SelectOptionWalletToken
