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

import useFetchListedFtsWorth from '@/api/apiDataHooks/utils/useFetchListedFtsWorth'
import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlphArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'

const useFetchWalletWorth = () => {
  const {
    data: alphBalances,
    isLoading: isLoadingAlphBalances,
    isFetching: isFetchingAlphBalances,
    error: errorAlphBalances
  } = useFetchWalletBalancesAlphArray()
  const {
    data: tokensBalances,
    isLoading: isLoadingTokensBalances,
    isFetching: isFetchingTokensBalances,
    error: errorTokensBalances
  } = useFetchWalletBalancesTokensArray()
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph: true,
    alphBalances,
    tokensBalances
  })
  const {
    data: { listedFts },
    isLoading: isLoadingTokensByListing
  } = useFetchTokensSeparatedByListing(allTokensBalances)
  const { data: worth, isLoading: isLoadingWorth } = useFetchListedFtsWorth({ listedFts })

  return {
    data: worth,
    isLoading: isLoadingWorth || isLoadingTokensByListing || isLoadingAlphBalances || isLoadingTokensBalances,
    isFetching: isFetchingAlphBalances || isFetchingTokensBalances,
    error: errorAlphBalances || errorTokensBalances
  }
}

export default useFetchWalletWorth
