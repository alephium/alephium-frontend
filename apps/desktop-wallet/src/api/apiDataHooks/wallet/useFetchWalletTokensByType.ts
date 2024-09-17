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

import useFetchSeparatedTokensByType from '@/api/apiDataHooks/utils/useFetchSeparatedTokensByType'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletAlphBalancesTotal from '@/api/apiDataHooks/wallet/useFetchWalletAlphBalancesTotal'
import useFetchWalletTokensBalancesTotal from '@/api/apiDataHooks/wallet/useFetchWalletTokensBalancesTotal'

interface UseFetchWalletTokensByType {
  includeAlph: boolean
}

const useFetchWalletTokensByType = ({ includeAlph }: UseFetchWalletTokensByType) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletAlphBalancesTotal({
    skip: !includeAlph
  })
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletTokensBalancesTotal()
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph,
    alphBalances,
    tokensBalances
  })
  const { data, isLoading } = useFetchSeparatedTokensByType(allTokensBalances)

  return {
    data,
    isLoading: isLoading || isLoadingTokensBalances || isLoadingAlphBalances
  }
}

export default useFetchWalletTokensByType
