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

import {
  PRICES_REFRESH_INTERVAL,
  selectDoVerifiedFungibleTokensNeedInitialization,
  syncTokenCurrentPrices,
  syncTokenPriceHistories,
  syncUnknownTokensInfo,
  syncVerifiedFungibleTokens,
  TRANSACTIONS_REFRESH_INTERVAL
} from '@alephium/shared'
import { useInitializeClient, useInterval } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import { StatusBar } from 'expo-status-bar'
import { difference, union } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ViewProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import ToastAnchor from '~/components/toasts/ToastAnchor'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useLoadStoredSettings from '~/hooks/useLoadStoredSettings'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import {
  makeSelectAddressesUnknownTokens,
  selectAllAddressVerifiedFungibleTokenSymbols,
  syncLatestTransactions
} from '~/store/addressesSlice'
import { store } from '~/store/store'
import { selectTransactionUnknownTokenIds } from '~/store/transactions/transactionSelectors'
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
          <StatusBar animated translucent style="light" />
          <RootStackNavigation />
          <ToastAnchor />
        </ThemeProvider>
      </Main>
    </Provider>
  )
}

const Main = ({ children, ...props }: ViewProps) => {
  const dispatch = useAppDispatch()
  const network = useAppSelector((s) => s.network)
  const isLoadingVerifiedFungibleTokens = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingUnverifiedFungibleTokens = useAppSelector((s) => s.fungibleTokens.loadingUnverified)
  const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const nbOfAddresses = useAppSelector((s) => s.addresses.ids.length)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const verifiedFungibleTokensNeedInitialization = useAppSelector(selectDoVerifiedFungibleTokensNeedInitialization)
  const verifiedFungibleTokenSymbols = useAppSelector(selectAllAddressVerifiedFungibleTokenSymbols)
  const settings = useAppSelector((s) => s.settings)

  const selectAddressesUnknownTokens = useMemo(makeSelectAddressesUnknownTokens, [])
  const addressUnknownTokenIds = useAppSelector(selectAddressesUnknownTokens)
  const txUnknownTokenIds = useAppSelector(selectTransactionUnknownTokenIds)
  const checkedUnknownTokenIds = useAppSelector((s) => s.app.checkedUnknownTokenIds)
  const newUnknownTokens = difference(union(addressUnknownTokenIds, txUnknownTokenIds), checkedUnknownTokenIds)

  useLoadStoredSettings()
  useInitializeClient()

  useEffect(() => {
    if (
      network.status === 'online' &&
      !verifiedFungibleTokensNeedInitialization &&
      !isLoadingUnverifiedFungibleTokens &&
      newUnknownTokens.length > 0
    ) {
      dispatch(syncUnknownTokensInfo(newUnknownTokens))
    }
  }, [
    dispatch,
    isLoadingUnverifiedFungibleTokens,
    network.status,
    newUnknownTokens,
    verifiedFungibleTokensNeedInitialization
  ])

  // Fetch verified tokens from GitHub token-list and sync current and historical prices for each verified fungible
  // token found in each address
  useEffect(() => {
    if (network.status === 'online' && !isLoadingVerifiedFungibleTokens) {
      if (verifiedFungibleTokensNeedInitialization) {
        dispatch(syncVerifiedFungibleTokens())
      } else if (verifiedFungibleTokenSymbols.uninitialized.length > 0) {
        const symbols = verifiedFungibleTokenSymbols.uninitialized

        dispatch(syncTokenCurrentPrices({ verifiedFungibleTokenSymbols: symbols, currency: settings.currency }))
        dispatch(syncTokenPriceHistories({ verifiedFungibleTokenSymbols: symbols, currency: settings.currency }))
      }
    }
  }, [
    dispatch,
    isLoadingVerifiedFungibleTokens,
    network.status,
    settings.currency,
    verifiedFungibleTokenSymbols.uninitialized,
    verifiedFungibleTokensNeedInitialization
  ])

  useEffect(() => {
    if (
      network.status === 'online' &&
      !isLoadingVerifiedFungibleTokens &&
      verifiedFungibleTokenSymbols.uninitialized.length > 1
    ) {
      console.log(
        'TODO: Sync address verified tokens balance histories for',
        verifiedFungibleTokenSymbols.uninitialized.filter((symbol) => symbol !== ALPH.symbol)
      )
    }
  }, [isLoadingVerifiedFungibleTokens, network.status, verifiedFungibleTokenSymbols.uninitialized])

  const refreshTokensLatestPrice = useCallback(() => {
    dispatch(
      syncTokenCurrentPrices({
        verifiedFungibleTokenSymbols: verifiedFungibleTokenSymbols.withPriceHistory,
        currency: settings.currency
      })
    )
  }, [dispatch, settings.currency, verifiedFungibleTokenSymbols.withPriceHistory])

  useInterval(
    refreshTokensLatestPrice,
    PRICES_REFRESH_INTERVAL,
    network.status !== 'online' || verifiedFungibleTokenSymbols.withPriceHistory.length === 0
  )

  const checkForNewTransactions = useCallback(() => {
    dispatch(syncLatestTransactions())
  }, [dispatch])

  const dataResyncNeeded = nbOfAddresses > 0 && network.status === 'online' && !isLoadingLatestTxs

  useEffect(() => {
    if (addressesStatus === 'uninitialized' && dataResyncNeeded) checkForNewTransactions()
  }, [addressesStatus, checkForNewTransactions, dataResyncNeeded])

  useInterval(
    checkForNewTransactions,
    TRANSACTIONS_REFRESH_INTERVAL,
    !dataResyncNeeded || addressesStatus === 'uninitialized'
  )

  return (
    <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
      {children}
    </SafeAreaProvider>
  )
}

export default App
