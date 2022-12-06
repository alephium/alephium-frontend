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
import { Search, X } from 'lucide-react-native'
import { ActivityIndicator, ScrollView } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import HighlightRow from '../components/HighlightRow'
import Screen, { BottomScreenSection, ScreenSection, ScreenSectionTitle } from '../components/layout/Screen'
import Toggle from '../components/Toggle'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { activeAddressesDiscovered, addressDiscoveryFinished, selectAllAddresses } from '../store/addressesSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddressDiscoveryScreen'>

const AddressDiscoveryScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addresses = useAppSelector(selectAllAddresses)
  const [discoveredAddresses, addressDiscoveryLoading] = useAppSelector((s) => [
    s.addresses.discoveredAddresses,
    s.addresses.addressDiscoveryLoading
  ])

  const startScan = () => dispatch(activeAddressesDiscovered())
  const stopScan = () => dispatch(addressDiscoveryFinished())

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          <AppText bold>Scan the blockchain to find your active addresses. This process might take a while.</AppText>
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Current addresses</ScreenSectionTitle>
          {addresses.map((address, index) => (
            <HighlightRow
              key={address.hash}
              title={address.settings.label || address.hash}
              subtitle={address.settings.label ? address.hash : undefined}
              truncate
              isTopRounded={index === 0}
              isBottomRounded={index === addresses.length - 1}
            >
              <Amount value={BigInt(address.networkData.availableBalance)} fadeDecimals bold />
            </HighlightRow>
          ))}
        </ScreenSection>
        {(addressDiscoveryLoading || discoveredAddresses.length > 0) && (
          <ScreenSection>
            <NewDiscoveredAddressesTitle>
              <ScreenSectionTitle>Newly discovered addresses</ScreenSectionTitle>
            </NewDiscoveredAddressesTitle>

            {addressDiscoveryLoading && (
              <ScanningIndication>
                <ActivityIndicator size="small" color={theme.font.tertiary} style={{ marginRight: 10 }} />
                <AppText color={theme.font.secondary}>Scanning...</AppText>
              </ScanningIndication>
            )}

            {discoveredAddresses.map((address, index) => (
              <HighlightRow
                key={address.address}
                title={address.address}
                truncate
                isTopRounded={index === 0}
                isBottomRounded={index === discoveredAddresses.length - 1}
              >
                <Toggle value={true} />
              </HighlightRow>
            ))}
          </ScreenSection>
        )}
      </ScrollView>
      <BottomScreenSection>
        {!addressDiscoveryLoading ? (
          <Button icon={<Search size={24} color={theme.font.contrast} />} title="Start scanning" onPress={startScan} />
        ) : (
          <Button icon={<X size={24} color={theme.font.contrast} />} title="Stop scanning" onPress={stopScan} />
        )}
      </BottomScreenSection>
    </Screen>
  )
}

export default AddressDiscoveryScreen

const ScanningIndication = styled.View`
  flex-direction: row;
  margin-bottom: 20px;
`

const NewDiscoveredAddressesTitle = styled.View`
  flex-direction: row;
`
