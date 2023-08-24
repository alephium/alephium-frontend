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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import Checkbox from 'expo-checkbox'
import { Import, Search, X } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import HighlightRow from '~/components/HighlightRow'
import { BottomScreenSection, ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { addressDiscoveryStopped, discoverAddresses, selectAllDiscoveredAddresses } from '~/store/addressDiscoverySlice'
import {
  addressesImported,
  selectAllAddresses,
  syncAddressesData,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { getRandomLabelColor } from '~/utils/colors'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'AddressDiscoveryScreen'>, ScrollScreenProps {}

const AddressDiscoveryScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addresses = useAppSelector(selectAllAddresses)
  const discoveredAddresses = useAppSelector(selectAllDiscoveredAddresses)
  const { loading, status, progress } = useAppSelector((s) => s.addressDiscovery)
  const persistAddressSettings = usePersistAddressSettings()
  const posthog = usePostHog()

  const [addressSelections, setAddressSelections] = useState<Record<AddressHash, boolean>>({})
  const [importLoading, setImportLoading] = useState(false)

  const isImporting = params?.isImporting
  const selectedAddressesToImport = discoveredAddresses.filter(({ hash }) => addressSelections[hash])

  const startScan = useCallback(() => dispatch(discoverAddresses()), [dispatch])

  const stopScan = () => dispatch(addressDiscoveryStopped())

  const importAddresses = async () => {
    setImportLoading(true)

    const newAddressHashes = selectedAddressesToImport.map((address) => address.hash)
    const newAddresses = selectedAddressesToImport.map(({ balance, ...address }) => ({
      ...address,
      settings: { isDefault: false, color: getRandomLabelColor() }
    }))

    try {
      await persistAddressSettings(newAddresses)
      dispatch(addressesImported(newAddresses))

      posthog?.capture('Imported discovered addresses')

      await dispatch(syncAddressesData(newAddressHashes))
      await dispatch(syncAddressesHistoricBalances(newAddressHashes))
    } catch (e) {
      console.error(e)

      posthog?.capture('Error', { message: 'Could not import addresses from address discovery' })
    }

    navigation.navigate(isImporting ? 'NewWalletSuccessScreen' : 'InWalletTabsNavigation')

    setImportLoading(false)
  }

  const toggleAddressSelection = (hash: AddressHash) => {
    if (loading) return

    setAddressSelections({
      ...addressSelections,
      [hash]: !addressSelections[hash]
    })
  }

  useEffect(() => {
    discoveredAddresses.forEach(({ hash }) => {
      if (addressSelections[hash] === undefined) {
        setAddressSelections({ ...addressSelections, [hash]: true })
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoveredAddresses])

  const cancelAndGoToWelcomeScreen = useCallback(() => {
    dispatch(addressDiscoveryStopped())
    navigation.navigate('NewWalletSuccessScreen')
  }, [dispatch, navigation])

  // Start scanning and override back navigation when in wallet import flow
  useFocusEffect(
    useCallback(() => {
      if (!isImporting) return

      posthog?.capture('Started address discovery from import flow')

      startScan()

      navigation.setOptions({
        headerLeft: () => null,
        headerRight: () => <Button onPress={cancelAndGoToWelcomeScreen} Icon={X} type="transparent" />
      })

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true)

      return subscription.remove
    }, [cancelAndGoToWelcomeScreen, isImporting, navigation, posthog, startScan])
  )

  const handleStartScanPress = () => {
    posthog?.capture('Started address discovery from settings')

    startScan()
  }

  const handleStopScanPress = () => {
    posthog?.capture('Stopped address discovery')

    stopScan()
  }

  const handleContinueScanPress = () => {
    posthog?.capture('Continued address discovery')

    startScan()
  }

  return (
    <ScrollScreen {...props}>
      <View>
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
            >
              <Amount value={BigInt(address.balance)} fadeDecimals bold />
            </HighlightRow>
          ))}
        </ScreenSection>
        {(loading || discoveredAddresses.length > 0) && (
          <ScreenSection>
            <ScreenSectionTitle>Newly discovered addresses</ScreenSectionTitle>

            {loading && (
              <ScanningIndication>
                <Row style={{ marginBottom: 10 }}>
                  <ActivityIndicator size="small" color={theme.font.tertiary} style={{ marginRight: 10 }} />
                  <AppText color="secondary">Scanning...</AppText>
                </Row>
                <ProgressBar progress={progress} color={theme.global.accent} />
              </ScanningIndication>
            )}

            {discoveredAddresses.map(({ hash, balance }, index) => (
              <HighlightRow key={hash} title={hash} truncate onPress={() => toggleAddressSelection(hash)}>
                <Row>
                  <AmountStyled value={BigInt(balance)} color="secondary" fadeDecimals />
                  <Checkbox
                    value={addressSelections[hash]}
                    disabled={loading}
                    onValueChange={() => toggleAddressSelection(hash)}
                  />
                </Row>
              </HighlightRow>
            ))}
          </ScreenSection>
        )}
      </View>
      <BottomScreenSection>
        {status === 'idle' && <ButtonStyled Icon={Search} title="Start scanning" onPress={handleStartScanPress} />}
        {status === 'started' && (
          <ButtonStyled Icon={X} title="Stop scanning" onPress={handleStopScanPress} type="secondary" />
        )}
        {status === 'stopped' && (
          <ContinueButton Icon={Search} title="Continue scanning" onPress={handleContinueScanPress} />
        )}
        {(status === 'stopped' || status === 'finished') && (
          <ButtonStyled
            Icon={Import}
            title="Import addresses"
            onPress={importAddresses}
            disabled={selectedAddressesToImport.length === 0}
          />
        )}
      </BottomScreenSection>
      <SpinnerModal isActive={importLoading} text="Importing addresses..." />
    </ScrollScreen>
  )
}

export default AddressDiscoveryScreen

const Row = styled.View`
  flex-direction: row;
`

const ScanningIndication = styled.View`
  margin-bottom: 20px;
  align-items: center;
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
