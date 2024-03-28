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

import { useEffect, useState } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { syncLatestTransactions } from '~/store/addressesSlice'

const RefreshSpinner = (props: Partial<RefreshControlProps>) => {
  const theme = useTheme()
  const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const dispatch = useAppDispatch()

  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false)

  useEffect(() => {
    if (!isLoadingLatestTxs) setIsSpinnerVisible(false)
  }, [isLoadingLatestTxs])

  const refreshData = () => {
    setIsSpinnerVisible(true)

    if (!isLoadingLatestTxs) {
      dispatch(syncLatestTransactions()).finally(() => setIsSpinnerVisible(false))
    }
  }

  return (
    <RefreshControl {...props} refreshing={isSpinnerVisible} onRefresh={refreshData} tintColor={theme.font.primary} />
  )
}

export default RefreshSpinner
