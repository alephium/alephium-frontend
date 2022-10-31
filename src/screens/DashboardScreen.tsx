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
import DashboardHeaderActions from '../components/DashboardHeaderActions'
import DefaultHeader, { DefaultHeaderProps } from '../components/headers/DefaultHeader'
import InWalletScrollScreen from '../components/layout/InWalletScrollScreen'
import { ScreenSection } from '../components/layout/Screen'
import WalletSwitch from '../components/WalletSwitch'
import useInWalletTabScreenHeader from '../hooks/layout/useInWalletTabScreenHeader'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteAllWallets } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'
import { fetchAddressesData, selectAddressIds } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'> {
  style?: StyleProp<ViewStyle>
}

const DashboardScreenHeader = (props: Partial<DefaultHeaderProps>) => (
  <DefaultHeader HeaderRight={<DashboardHeaderActions />} HeaderLeft={<WalletSwitch />} {...props} />
)

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const updateHeader = useInWalletTabScreenHeader(DashboardScreenHeader, navigation)
  const isLoading = useAppSelector((state) => state.addresses.loading)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  const refreshData = () => {
    if (!isLoading) dispatch(fetchAddressesData(addressHashes))
  }

  // TODO: Delete before release
  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.getParent()?.navigate('LandingScreen')
  }

  return (
    <InWalletScrollScreen
      style={style}
      onScrollYChange={updateHeader}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
    >
      <ScreenSection>
        <BalanceSummary />
      </ScreenSection>
      <AddressesTokensList />
      <Button
        title="Delete all wallets"
        onPress={handleDeleteAllWallets}
        style={{ marginBottom: 120, marginTop: 600 }}
      />
    </InWalletScrollScreen>
  )
}

export default DashboardScreen
