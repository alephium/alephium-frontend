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

import { PossibleNextScreenAfterDestination } from '~/navigation/SendNavigation'
import { AddressHash } from '~/types/addresses'

type RootStackParamList = {
  LandingScreen: undefined
  NewWalletIntroScreen: undefined
  NewWalletNameScreen: undefined
  PinCodeCreationScreen: undefined
  AddBiometricsScreen?: {
    skipAddressDiscovery?: boolean
  }
  NewWalletSuccessScreen: undefined
  ImportWalletSeedScreen: undefined
  ImportWalletAddressDiscoveryScreen: undefined
  InWalletTabsNavigation: undefined
  LoginScreen: {
    walletIdToLogin?: string
    workflow: 'wallet-switch' | 'wallet-unlock'
  }
  SplashScreen: undefined
  SwitchWalletScreen?: {
    disableBack?: boolean
  }
  NewAddressNavigation: undefined
  EditAddressScreen: {
    addressHash: AddressHash
  }
  SettingsScreen: undefined
  SendNavigation: undefined
  ReceiveNavigation: undefined
  ContactScreen: {
    contactId: string
  }
  SecurityScreen: undefined
  AddressDiscoveryScreen?: {
    isImporting?: boolean
  }
  CurrencySelectScreen: undefined
  NewContactScreen: undefined
  EditContactScreen: {
    contactId: string
  }
  SelectContactScreen: {
    nextScreen: PossibleNextScreenAfterDestination
  }
  SelectAddressScreen: {
    nextScreen: PossibleNextScreenAfterDestination
  }
}

export default RootStackParamList
