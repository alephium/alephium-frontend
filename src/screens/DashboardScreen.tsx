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

import { StackScreenProps } from '@react-navigation/stack'
import { RefreshControl, StyleProp, ViewStyle } from 'react-native'

import AddressesTokensList from '../components/AddressesTokensList'
import BalanceSummary from '../components/BalanceSummary'
import Button from '../components/buttons/Button'
import { ScreenSection } from '../components/layout/Screen'
import ScrollScreen from '../components/layout/ScrollScreen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteAllWallets } from '../persistent-storage/wallets'
import { selectAddressIds, syncAddressesData } from '../store/addressesSlice'
import { appReset } from '../store/appSlice'
import { AddressHash } from '../types/addresses'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'> {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.addresses.loading)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  // TODO: Delete before release
  const resetApp = async () => {
    await deleteAllWallets()
    dispatch(appReset())
    navigation.navigate('LandingScreen')
  }

  return (
    <ScrollScreen style={style} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}>
      <ScreenSection>
        <BalanceSummary />
      </ScreenSection>
      <AddressesTokensList />
      <Button title="Reset app" onPress={resetApp} style={{ marginBottom: 120, marginTop: 600 }} />
    </ScrollScreen>
  )
}

export default DashboardScreen
