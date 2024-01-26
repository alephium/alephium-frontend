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

import { AddressHash } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import Checkbox from 'expo-checkbox'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
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
import { VERTICAL_GAP } from '~/style/globalStyle'
import { getRandomLabelColor } from '~/utils/colors'
import { resetNavigation } from '~/utils/navigation'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'AddressDiscoveryScreen'>, ScrollScreenProps {}

const AddressDiscoveryScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addresses = useAppSelector(selectAllAddresses)
  const discoveredAddresses = useAppSelector(selectAllDiscoveredAddresses)
  const { loading, status, progress } = useAppSelector((s) => s.addressDiscovery)
  const networkName = useAppSelector((s) => s.network.name)
  const persistAddressSettings = usePersistAddressSettings()

  const [addressSelections, setAddressSelections] = useState<Record<AddressHash, boolean>>({})
  const [importLoading, setImportLoading] = useState(false)

  const isImporting = params?.isImporting
  const selectedAddressesToImport = discoveredAddresses.filter(({ hash }) => addressSelections[hash])

  const startScan = useCallback(() => dispatch(discoverAddresses()), [dispatch])

  const stopScan = () => dispatch(addressDiscoveryStopped())

  const continueToNextScreen = () =>
    isImporting ? resetNavigation(navigation, 'NewWalletSuccessScreen') : navigation.goBack()

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

      sendAnalytics('Imported discovered addresses')

      await dispatch(syncAddressesData(newAddressHashes))
      await dispatch(syncAddressesHistoricBalances(newAddressHashes))
    } catch (e) {
      console.error(e)

      sendAnalytics('Error', { message: 'Could not import addresses from address discovery' })
    }

    continueToNextScreen()

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

  const handleStartScanPress = () => {
    sendAnalytics('Started address discovery from settings')

    startScan()
  }

  const handleStopScanPress = () => {
    sendAnalytics('Stopped address discovery')

    stopScan()
  }

  const handleContinueScanPress = () => {
    sendAnalytics('Continued address discovery')

    startScan()
  }

  return (
    <ScrollScreen verticalGap fill screenTitle="Active addresses" headerOptions={{ type: 'stack' }} {...props}>
      <ScreenSection>
        <AppText bold>
          Scan the blockchain to find your active addresses on the &quot;{networkName}&quot; network. This process might
          take a while.
        </AppText>
      </ScreenSection>
      <ScreenSection fill>
        <ScreenSectionTitle>Current addresses</ScreenSectionTitle>
        <BoxSurface>
          {addresses.map((address, index) => (
            <Row
              key={address.hash}
              title={address.settings.label || address.hash}
              subtitle={address.settings.label ? address.hash : undefined}
              truncate
              isLast={index === addresses.length - 1}
            >
              <Amount value={BigInt(address.balance)} fadeDecimals bold />
            </Row>
          ))}
        </BoxSurface>
        {(loading || status === 'finished' || discoveredAddresses.length > 0) && !importLoading && (
          <>
            <ScreenSectionTitle style={{ marginTop: VERTICAL_GAP }}>Newly discovered addresses</ScreenSectionTitle>
            {loading && (
              <ScanningIndication>
                <Row transparent style={{ marginBottom: 10 }} isLast>
                  <ActivityIndicator size="small" color={theme.font.tertiary} style={{ marginRight: 10 }} />
                  <AppText color="secondary">Scanning...</AppText>
                </Row>
                <ProgressBar progress={progress} color={theme.global.accent} />
              </ScanningIndication>
            )}

            {discoveredAddresses.length > 0 && (
              <BoxSurface>
                {discoveredAddresses.map(({ hash, balance }, index) => (
                  <Row
                    key={hash}
                    title={hash}
                    truncate
                    onPress={() => toggleAddressSelection(hash)}
                    isLast={index === discoveredAddresses.length - 1}
                  >
                    <AmountContent>
                      <AmountStyled value={BigInt(balance)} color="secondary" fadeDecimals />
                      <Checkbox
                        value={addressSelections[hash]}
                        disabled={loading}
                        onValueChange={() => toggleAddressSelection(hash)}
                      />
                    </AmountContent>
                  </Row>
                ))}
              </BoxSurface>
            )}
            {discoveredAddresses.length === 0 && status === 'finished' && (
              <AppText>Did not find any new addresses, please continue.</AppText>
            )}
          </>
        )}
      </ScreenSection>
      <ScreenSection centered>
        {status === 'idle' && (
          <ButtonStyled
            iconProps={{ name: 'search-outline' }}
            title="Start scanning"
            onPress={handleStartScanPress}
            variant="highlight"
          />
        )}
        {status === 'started' && (
          <ButtonStyled
            iconProps={{ name: 'close-outline' }}
            title="Stop scanning"
            onPress={handleStopScanPress}
            variant="highlight"
          />
        )}
        {status === 'stopped' && (
          <ContinueButton
            iconProps={{ name: 'search-outline' }}
            title="Continue scanning"
            onPress={handleContinueScanPress}
            variant="highlight"
          />
        )}
        {discoveredAddresses.length > 0 && (status === 'stopped' || status === 'finished') && (
          <ButtonStyled
            iconProps={{ name: 'download-outline' }}
            title="Import selected addresses"
            onPress={importAddresses}
            disabled={selectedAddressesToImport.length === 0}
            variant="highlight"
          />
        )}
        {discoveredAddresses.length === 0 && status === 'finished' && !importLoading && (
          <ButtonStyled
            iconProps={{ name: isImporting ? 'arrow-forward-outline' : 'arrow-back-outline' }}
            title={isImporting ? 'Continue' : 'Go back'}
            onPress={continueToNextScreen}
            variant={isImporting ? 'highlight' : 'accent'}
          />
        )}
      </ScreenSection>
      <SpinnerModal isActive={importLoading} text="Importing addresses..." blur={false} />
    </ScrollScreen>
  )
}

export default AddressDiscoveryScreen

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

const AmountContent = styled.View`
  flex-direction: row;
  align-items: center;
`
