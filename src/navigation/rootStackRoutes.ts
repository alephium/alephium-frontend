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
import { AddressConfirmedTransaction } from '~/types/transactions'

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
  SwitchNetworkScreen: undefined
  TransactionScreen: {
    // TODO: Make all params serializable to help with state persistance
    tx: AddressConfirmedTransaction
  }
  SendNavigation: undefined
  ReceiveNavigation: undefined
  SecurityScreen: undefined
  AddressDiscoveryScreen?: {
    isImporting?: boolean
  }
  CurrencySelectScreen: undefined
  ContactScreen: {
    contactId: string
  }
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
  AddressQuickNavigationScreen: undefined
}

export default RootStackParamList
