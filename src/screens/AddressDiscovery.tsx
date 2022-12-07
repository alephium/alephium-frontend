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
import Checkbox from 'expo-checkbox'
import { Import, Search, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import HighlightRow from '../components/HighlightRow'
import Screen, { BottomScreenSection, ScreenSection, ScreenSectionTitle } from '../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import {
  addressDiscoveryStopped,
  addressesDiscovered,
  addressesImported,
  DiscoveredAddress,
  selectAllDiscoveredAddresses
} from '../store/addressDiscoverySlice'
import { addressesDataFetched, selectAllAddresses } from '../store/addressesSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddressDiscoveryScreen'>

const AddressDiscoveryScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addresses = useAppSelector(selectAllAddresses)
  const discoveredAddresses = useAppSelector(selectAllDiscoveredAddresses)
  const { loading, status } = useAppSelector((state) => state.addressDiscovery)
  const [selectedAddressesToImport, setSelectedAddressesToImport] = useState<DiscoveredAddress[]>([])

  const startScan = () => dispatch(addressesDiscovered())
  const stopScan = () => dispatch(addressDiscoveryStopped())

  const importAddresses = () => {
    dispatch(addressesImported(selectedAddressesToImport))
    dispatch(addressesDataFetched(selectedAddressesToImport.map((address) => address.hash)))
    // TODO
    // create an async thunk to:
    // - addressesAdded
    // - addressesDataFetched
    // - store address metadata
    // Also, DRY: src/screens/NewAddressScreen.tsx
  }

  const toggleAddressSelection = (address: DiscoveredAddress) => {
    if (loading) return

    const selectedAddressIndex = selectedAddressesToImport.findIndex((a) => a.hash === address.hash)

    setSelectedAddressesToImport(
      selectedAddressIndex > -1
        ? selectedAddressesToImport.filter((a) => a.hash !== address.hash)
        : [...selectedAddressesToImport, address]
    )
  }

  useEffect(() => {
    setSelectedAddressesToImport(discoveredAddresses.filter((address) => BigInt(address.balance) > 0))
  }, [discoveredAddresses])

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
        <FullHeight>
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
          {(loading || discoveredAddresses.length > 0) && (
            <ScreenSection>
              <NewDiscoveredAddressesTitle>
                <ScreenSectionTitle>Newly discovered addresses</ScreenSectionTitle>
              </NewDiscoveredAddressesTitle>

              {loading && (
                <ScanningIndication>
                  <ActivityIndicator size="small" color={theme.font.tertiary} style={{ marginRight: 10 }} />
                  <AppText color={theme.font.secondary}>Scanning...</AppText>
                </ScanningIndication>
              )}

              {discoveredAddresses.map((address, index) => (
                <HighlightRow
                  key={address.hash}
                  title={address.hash}
                  truncate
                  isTopRounded={index === 0}
                  isBottomRounded={index === discoveredAddresses.length - 1}
                  onPress={() => toggleAddressSelection(address)}
                >
                  <RowRightContent>
                    <AmountStyled value={BigInt(address.balance)} color={theme.font.secondary} fadeDecimals />
                    <Checkbox
                      value={selectedAddressesToImport.findIndex((a) => a.hash === address.hash) > -1}
                      disabled={loading}
                      onValueChange={() => toggleAddressSelection(address)}
                    />
                  </RowRightContent>
                </HighlightRow>
              ))}
            </ScreenSection>
          )}
        </FullHeight>
        <BottomScreenSection>
          {status === 'idle' && (
            <ButtonStyled
              icon={<Search size={24} color={theme.font.contrast} />}
              title="Start scanning"
              onPress={startScan}
            />
          )}
          {status === 'started' && (
            <ButtonStyled
              icon={<X size={24} color={theme.font.contrast} />}
              title="Stop scanning"
              onPress={stopScan}
              type="secondary"
            />
          )}
          {status === 'stopped' && (
            <ContinueButton
              icon={<Search size={24} color={theme.font.contrast} />}
              title="Continue scanning"
              onPress={startScan}
            />
          )}
          {(status === 'stopped' || status === 'finished') && (
            <ButtonStyled
              icon={<Import size={24} color={theme.font.contrast} />}
              title="Import addresses"
              onPress={importAddresses}
              disabled={selectedAddressesToImport.length === 0}
            />
          )}
        </BottomScreenSection>
      </ScrollView>
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

const RowRightContent = styled.View`
  flex-direction: row;
`

const AmountStyled = styled(Amount)`
  margin-right: 10px;
`

const ButtonStyled = styled(Button)`
  width: 100%;
`

const ContinueButton = styled(ButtonStyled)`
  margin-bottom: 24px;
`

const FullHeight = styled.View``
