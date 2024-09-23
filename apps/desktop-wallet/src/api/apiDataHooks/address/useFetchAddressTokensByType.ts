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

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'

interface UseFetchAddressTokensByType extends UseFetchAddressProps {
  includeAlph: boolean
}

const useFetchAddressTokensByType = (props: UseFetchAddressTokensByType) => {
  const { data: allTokensBalances, isLoading: isLoadingBalances } = useFetchAddressBalances(props)
  const { data, isLoading } = useFetchTokensSeparatedByType(allTokensBalances)

  return {
    data,
    isLoading: isLoading || isLoadingBalances
  }
}

export default useFetchAddressTokensByType
