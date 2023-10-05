/*
Copyright 2018 - 2022 The Alephium Authors
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
import { isEnrolledAsync } from 'expo-local-authentication'
import { StatusBar } from 'expo-status-bar'
import { difference } from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, AppState, AppStateStatus, ViewProps } from 'react-native'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import client from '~/api/client'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useInterval from '~/hooks/useInterval'
import useLoadStoredSettings from '~/hooks/useLoadStoredSettings'
import RootStackNavigation from '~/navigation/RootStackNavigation'
import { loadBiometricsSettings, storeBiometricsSettings } from '~/persistent-storage/settings'
import {
  deriveWalletStoredAddresses,
  disableBiometrics,
  getStoredWallet,
  getWalletMetadata
} from '~/persistent-storage/wallet'
import {
  makeSelectAddressesUnknownTokens,
  selectAddressIds,
  syncAddressesData,
  syncAddressesDataWhenPendingTxsConfirm,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { appBecameInactive } from '~/store/appSlice'
import { syncNetworkTokensInfo, syncUnknownTokensInfo } from '~/store/assets/assetsActions'
import { selectIsTokensMetadataUninitialized } from '~/store/assets/assetsSelectors'
import { apiClientInitFailed, apiClientInitSucceeded } from '~/store/networkSlice'
import { selectAllPendingTransactions } from '~/store/pendingTransactionsSlice'
import { biometricsToggled } from '~/store/settingsSlice'
import { store } from '~/store/store'
import { makeSelectAddressesHashesWithPendingTransactions } from '~/store/transactions/transactionSelectors'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { themes } from '~/style/themes'
import { navigateRootStack, resetNavigationState, setNavigationState } from '~/utils/navigation'

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
        </ThemeProvider>
      </Main>
    </Provider>
  )
}

const Main = ({ children, ...props }: ViewProps) => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const walletId = useAppSelector((s) => s.wallet.id)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const network = useAppSelector((s) => s.network)
  const addressIds = useAppSelector(selectAddressIds)
  const assetsInfo = useAppSelector((s) => s.assetsInfo)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)
  const isSyncingAddressData = useAppSelector((s) => s.addresses.syncingAddressData)
  const isTokensMetadataUninitialized = useAppSelector(selectIsTokensMetadataUninitialized)
  const selectAddressesHashesWithPendingTransactions = useMemo(makeSelectAddressesHashesWithPendingTransactions, [])
  const addressesWithPendingTxs = useAppSelector(selectAddressesHashesWithPendingTransactions)
  const pendingTxs = useAppSelector(selectAllPendingTransactions)

  const selectAddressesUnknownTokens = useMemo(makeSelectAddressesUnknownTokens, [])
  const unknownTokens = useAppSelector(selectAddressesUnknownTokens)
  const checkedUnknownTokenIds = useAppSelector((s) => s.assetsInfo.checkedUnknownTokenIds)
  const unknownTokenIds = unknownTokens.map((token) => token.id)
  const newUnknownTokens = difference(unknownTokenIds, checkedUnknownTokenIds)

  const [isUnlockingApp, setIsUnlockingApp] = useState(false)

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
      if (assetsInfo.status === 'uninitialized' && !isLoadingTokensMetadata) {
        dispatch(syncNetworkTokensInfo())
      }
      if (addressesStatus === 'uninitialized') {
        if (!isSyncingAddressData && addressIds.length > 0) {
          dispatch(syncAddressesData())
          dispatch(syncAddressesHistoricBalances())
        }
      } else if (addressesStatus === 'initialized') {
        if (!isTokensMetadataUninitialized && !isLoadingTokensMetadata && newUnknownTokens.length > 0) {
          dispatch(syncUnknownTokensInfo(newUnknownTokens))
        }
      }
    }
  }, [
    addressIds.length,
    addressesStatus,
    assetsInfo.status,
    dispatch,
    isLoadingTokensMetadata,
    isSyncingAddressData,
    isTokensMetadataUninitialized,
    network.status,
    newUnknownTokens
  ])

  const refreshAddressDataWhenPendingTxsConfirm = useCallback(() => {
    dispatch(syncAddressesDataWhenPendingTxsConfirm({ addresses: addressesWithPendingTxs, pendingTxs }))
  }, [addressesWithPendingTxs, dispatch, pendingTxs])

  useInterval(refreshAddressDataWhenPendingTxsConfirm, 5000, pendingTxs.length === 0)

  const unlockApp = useCallback(async () => {
    if (walletMnemonic) return

    setIsUnlockingApp(true)

    try {
      const deviceHasBiometricsData = await isEnrolledAsync()
      const walletMetadata = await getWalletMetadata()
      let isBioEnabled = await loadBiometricsSettings()

      // Disable biometrics if needed
      if (isBioEnabled && !deviceHasBiometricsData) {
        await disableBiometrics()
        await storeBiometricsSettings(false)
        dispatch(biometricsToggled(false))
        isBioEnabled = false
      }

      const wallet = await getStoredWallet()

      if (!wallet) {
        if (lastNavigationState) {
          setNavigationState(lastNavigationState)
        } else {
          navigateRootStack('LandingScreen')
        }
      } else {
        if (isBioEnabled) {
          const addressesToInitialize =
            addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
          dispatch(walletUnlocked({ wallet, addressesToInitialize, contacts: walletMetadata?.contacts ?? [] }))

          lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()
        } else {
          navigateRootStack('LoginWithPinScreen')
        }
      }

      // TODO: Revisit error handling with proper error codes
    } catch (e: unknown) {
      const error = e as { message?: string }

      if (error.message?.includes('User canceled')) {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: unlockApp }
        ])
      } else {
        console.error(e)
      }
    } finally {
      setIsUnlockingApp(false)
    }
  }, [walletMnemonic, addressesStatus, dispatch, lastNavigationState])

  useEffect(() => {
    // We want this to only run 1 time and not every time lastNavigationState changes (dep of unlockApp).
    if (!walletMnemonic && appState.current === 'active' && !isUnlockingApp) {
      unlockApp()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletMnemonic])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && walletMnemonic && !isCameraOpen) {
        navigateRootStack('SplashScreen')
        dispatch(appBecameInactive())
      } else if (nextAppState === 'active' && !walletMnemonic && !isCameraOpen && !isUnlockingApp) {
        unlockApp()
      }

      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return subscription.remove
  }, [walletId, walletMnemonic, dispatch, isCameraOpen, isUnlockingApp, unlockApp])

  return (
    <RootSiblingParent>
      <SafeAreaProvider {...props} style={[{ backgroundColor: 'black' }, props.style]}>
        {children}
      </SafeAreaProvider>
    </RootSiblingParent>
  )
}

export default App
