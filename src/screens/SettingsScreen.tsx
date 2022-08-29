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
import { Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react-native'
import { Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import HighlightRow from '../components/HighlightRow'
import Select from '../components/inputs/Select'
import Screen, { ScreenSection } from '../components/layout/Screen'
import Text from '../components/Text'
import Toggle from '../components/Toggle'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteWalletByName } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'
import { currencyChanged, discreetModeChanged, passwordRequirementChanged, themeChanged } from '../store/settingsSlice'
import { Currency } from '../types/settings'
import { currencies } from '../utils/currencies'

type ScreenProps = StackScreenProps<RootStackParamList, 'SettingsScreen'>

const SettingsScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()

  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const passwordRequirement = useAppSelector((state) => state.settings.passwordRequirement)
  const currentTheme = useAppSelector((state) => state.settings.theme)
  const currentNetworkName = useAppSelector((state) => state.network.name)
  const currentWalletName = useAppSelector((state) => state.activeWallet.name)
  const currentCurrency = useAppSelector((state) => state.settings.currency)

  const currencyOptions = Object.values(currencies).map((currency) => ({
    label: `${currency.name} (${currency.ticker})`,
    value: currency.ticker
  }))

  const handleDiscreetModeChange = (value: boolean) => dispatch(discreetModeChanged(value))
  const handlePasswordRequirementChange = (value: boolean) => dispatch(passwordRequirementChanged(value))
  const handleThemeChange = (value: boolean) => dispatch(themeChanged(value ? 'dark' : 'light'))
  const handleCurrencyChange = (currency: Currency) => dispatch(currencyChanged(currency))

  const handleDeleteButtonPress = () => {
    Alert.alert(
      'Deleting wallet',
      'Are you sure you want to delete your wallet? Ensure you have a backup of your secret recovery phrase.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteWalletByName(currentWalletName)
            dispatch(walletFlushed())
            navigation.navigate('SwitchWalletAfterDeletionScreen')
          }
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
            <Toggle value={discreetMode} onValueChange={handleDiscreetModeChange} />
          </HighlightRow>
          <HighlightRow title="Require authentication" subtitle="For important actions" hasBottomBorder>
            <Toggle value={passwordRequirement} onValueChange={handlePasswordRequirementChange} />
          </HighlightRow>
          <HighlightRow title="Use dark theme" subtitle="Try it, it's nice" hasBottomBorder>
            <Toggle value={currentTheme === 'dark'} onValueChange={handleThemeChange} />
          </HighlightRow>
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
          <ScreenSectionTitle>Wallets</ScreenSectionTitle>
          <ButtonStyled
            title="Add a new wallet"
            icon={<PlusIcon size={24} color={theme.global.valid} />}
            variant="valid"
            onPress={() => navigation.navigate('LandingScreen')}
          />
          <Button
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

const ScreenSectionTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: 8px;
  margin-bottom: 24px;
`

const CurrentNetwork = styled(Text)`
  font-weight: bold;
`

const ButtonStyled = styled(Button)`
  margin-bottom: 24px;
`
