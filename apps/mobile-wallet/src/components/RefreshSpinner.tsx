import { useEffect, useState } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { syncLatestTransactions } from '~/store/addresses/addressesActions'

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
      dispatch(syncLatestTransactions({ addresses: 'all', areAddressesNew: false })).finally(() =>
        setIsSpinnerVisible(false)
      )
    }
  }

  return (
    <RefreshControl {...props} refreshing={isSpinnerVisible} onRefresh={refreshData} tintColor={theme.font.primary} />
  )
}

export default RefreshSpinner
