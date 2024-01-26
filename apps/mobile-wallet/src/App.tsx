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

import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { StatusBar } from 'expo-status-bar'
import { difference, union } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import client from '~/api/client'
import ToastAnchor from '~/components/toasts/ToastAnchor'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useInterval from '~/hooks/useInterval'
import useLoadStoredSettings from '~/hooks/useLoadStoredSettings'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import {
  makeSelectAddressesUnknownTokens,
  selectAddressIds,
  syncAddressesData,
  syncAddressesDataWhenPendingTxsConfirm,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { syncNetworkFungibleTokensInfo, syncUnknownTokensInfo } from '~/store/assets/assetsActions'
import { selectIsFungibleTokensMetadataUninitialized } from '~/store/assets/assetsSelectors'
import { apiClientInitFailed, apiClientInitSucceeded } from '~/store/networkSlice'
import { selectAllPendingTransactions } from '~/store/pendingTransactionsSlice'
import { store } from '~/store/store'
import {
  makeSelectAddressesHashesWithPendingTransactions,
  selectTransactionUnknownTokenIds
} from '~/store/transactions/transactionSelectors'
import { themes } from '~/style/themes'

dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'some sec',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  }
})

const App = () => {
  const [theme, setTheme] = useState<DefaultTheme>(themes.light)

  useEffect(
    () =>
      store.subscribe(() => {
        setTheme(themes[store.getState().settings.theme])
      }),
    []
  )

  return (
    <Provider store={store}>
      <Main>
        <ThemeProvider theme={theme}>
          <RootStackNavigation />
          <StatusBar style={theme.name === 'light' ? 'dark' : 'light'} />
          <ToastAnchor />
        </ThemeProvider>
      </Main>
    </Provider>
  )
}

const Main = ({ children, ...props }: ViewProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const network = useAppSelector((s) => s.network)
  const addressIds = useAppSelector(selectAddressIds)
  const fungibleTokens = useAppSelector((s) => s.fungibleTokens)
  const isLoadingFungibleTokensMetadata = useAppSelector((s) => s.fungibleTokens.loading)
  const isSyncingAddressData = useAppSelector((s) => s.addresses.syncingAddressData)
  const isFungibleTokensMetadataUninitialized = useAppSelector(selectIsFungibleTokensMetadataUninitialized)
  const selectAddressesHashesWithPendingTransactions = useMemo(makeSelectAddressesHashesWithPendingTransactions, [])
  const addressesWithPendingTxs = useAppSelector(selectAddressesHashesWithPendingTransactions)
  const pendingTxs = useAppSelector(selectAllPendingTransactions)

  const selectAddressesUnknownTokens = useMemo(makeSelectAddressesUnknownTokens, [])
  const addressUnknownTokenIds = useAppSelector(selectAddressesUnknownTokens)
  const txUnknownTokenIds = useAppSelector(selectTransactionUnknownTokenIds)
  const checkedUnknownTokenIds = useAppSelector((s) => s.app.checkedUnknownTokenIds)
  const newUnknownTokens = difference(union(addressUnknownTokenIds, txUnknownTokenIds), checkedUnknownTokenIds)

  useLoadStoredSettings()

  const initializeClient = useCallback(async () => {
    try {
      client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.node.infos.getInfosChainParams()
      // TODO: Check if connection to explorer also works
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
      console.log(`Client initialized. Current network: ${network.name}`)
    } catch (e) {
      dispatch(apiClientInitFailed())
      console.error('Could not connect to network: ', network.name)
      console.error(e)
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  const shouldInitialize = network.status === 'offline'
  useInterval(initializeClient, 2000, !shouldInitialize)

  useEffect(() => {
    if (network.status === 'online') {
      if (fungibleTokens.status === 'uninitialized' && !isLoadingFungibleTokensMetadata) {
        dispatch(syncNetworkFungibleTokensInfo())
      }
      if (addressesStatus === 'uninitialized') {
        if (!isSyncingAddressData && addressIds.length > 0) {
          dispatch(syncAddressesData())
          dispatch(syncAddressesHistoricBalances())
        }
      } else if (addressesStatus === 'initialized') {
        if (!isFungibleTokensMetadataUninitialized && !isLoadingFungibleTokensMetadata && newUnknownTokens.length > 0) {
          dispatch(syncUnknownTokensInfo(newUnknownTokens))
        }
      }
    }
  }, [
    addressIds.length,
    addressesStatus,
    fungibleTokens.status,
    dispatch,
    isLoadingFungibleTokensMetadata,
    isSyncingAddressData,
    isFungibleTokensMetadataUninitialized,
    network.status,
    newUnknownTokens
  ])

  const refreshAddressDataWhenPendingTxsConfirm = useCallback(() => {
    dispatch(syncAddressesDataWhenPendingTxsConfirm({ addresses: addressesWithPendingTxs, pendingTxs }))
  }, [addressesWithPendingTxs, dispatch, pendingTxs])

  useInterval(refreshAddressDataWhenPendingTxsConfirm, 5000, pendingTxs.length === 0)

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
