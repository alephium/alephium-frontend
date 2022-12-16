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
import { capitalize } from 'lodash'
import { Plus as PlusIcon, Search, Trash2 as TrashIcon } from 'lucide-react-native'
import { Alert, ScrollView } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import HighlightRow from '../components/HighlightRow'
import Select from '../components/inputs/Select'
import Screen, { ScreenSection, ScreenSectionTitle } from '../components/layout/Screen'
import Toggle from '../components/Toggle'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import useBiometrics from '../hooks/useBiometrics'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteWalletById, disableBiometrics, enableBiometrics } from '../persistent-storage/wallets'
import { biometricsDisabled, biometricsEnabled, walletDeleted } from '../store/activeWalletSlice'
import { currencySelected, discreetModeToggled, passwordRequirementToggled, themeChanged } from '../store/settingsSlice'
import { Currency } from '../types/settings'
import { currencies } from '../utils/currencies'

type ScreenProps = StackScreenProps<RootStackParamList, 'SettingsScreen'>

const currencyOptions = Object.values(currencies).map((currency) => ({
  label: `${currency.name} (${currency.ticker})`,
  value: currency.ticker
}))

const SettingsScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const hasAvailableBiometrics = useBiometrics()
  const [
    { discreetMode, requireAuth, theme: currentTheme, currency: currentCurrency },
    currentNetworkName,
    activeWallet
  ] = useAppSelector((s) => [s.settings, s.network.name, s.activeWallet])

  const isBiometricsEnabled = activeWallet.authType === 'biometrics'

  const toggleBiometrics = async () => {
    if (isBiometricsEnabled) {
      await disableBiometrics(activeWallet.metadataId)
      dispatch(biometricsDisabled())
    } else {
      await enableBiometrics(activeWallet.metadataId, activeWallet.mnemonic)
      dispatch(biometricsEnabled())
    }
  }

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const toggleTheme = (value: boolean) => dispatch(themeChanged(value ? 'dark' : 'light'))

  const toggleAuthRequirement = () => dispatch(passwordRequirementToggled())

  const handleCurrencyChange = (currency: Currency) => dispatch(currencySelected(currency))

  const deleteWallet = async () => {
    await deleteWalletById(activeWallet.metadataId)
    dispatch(walletDeleted())
    navigation.navigate('SwitchWalletAfterDeletionScreen')
  }

  const handleDeleteButtonPress = () => {
    if (!activeWallet.metadataId) return

    Alert.alert(
      'Deleting wallet',
      'Are you sure you want to delete your wallet? Ensure you have a backup of your secret recovery phrase.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: deleteWallet
        }
      ]
    )
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          <ScreenSectionTitle>General</ScreenSectionTitle>
          <HighlightRow title="Discreet mode" subtitle="Hide all amounts" isTopRounded hasBottomBorder>
            <Toggle value={discreetMode} onValueChange={toggleDiscreetMode} />
          </HighlightRow>
          <HighlightRow title="Require authentication" subtitle="For important actions" hasBottomBorder>
            <Toggle value={requireAuth} onValueChange={toggleAuthRequirement} />
          </HighlightRow>
          <HighlightRow title="Use dark theme" subtitle="Try it, it's nice" hasBottomBorder>
            <Toggle value={currentTheme === 'dark'} onValueChange={toggleTheme} />
          </HighlightRow>
          {hasAvailableBiometrics && (
            <HighlightRow title="Biometrics authentication" subtitle="Enhance your security" hasBottomBorder>
              <Toggle value={isBiometricsEnabled} onValueChange={toggleBiometrics} />
            </HighlightRow>
          )}
          <Select
            options={currencyOptions}
            label="Currency"
            value={currentCurrency}
            onValueChange={handleCurrencyChange}
            isBottomRounded
          />
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Networks</ScreenSectionTitle>
          <HighlightRow
            title="Current network"
            isTopRounded
            isBottomRounded
            onPress={() => navigation.navigate('SwitchNetworkScreen')}
          >
            <CurrentNetwork>{capitalize(currentNetworkName)}</CurrentNetwork>
          </HighlightRow>
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Addresses</ScreenSectionTitle>
          <ButtonStyled
            title="Scan for active addresses"
            icon={<Search size={24} color={theme.font.contrast} />}
            variant="accent"
            onPress={() => navigation.navigate('AddressDiscoveryScreen')}
          />
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Wallets</ScreenSectionTitle>
          <ButtonStyled
            title="Add a new wallet"
            icon={<PlusIcon size={24} color={theme.global.valid} />}
            variant="valid"
            onPress={() => navigation.navigate('LandingScreen')}
          />
          <ButtonStyled
            title="Delete this wallet"
            icon={<TrashIcon size={24} color={theme.global.alert} />}
            variant="alert"
            onPress={handleDeleteButtonPress}
          />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default SettingsScreen

const CurrentNetwork = styled(AppText)`
  font-weight: bold;
`

const ButtonStyled = styled(Button)`
  margin-bottom: 24px;
`
