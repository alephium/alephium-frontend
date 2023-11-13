/*
Copyright 2018 - 2023 The Alephium Authors
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

import { ParamListBase } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'

import RootStackParamList from '~/navigation/rootStackRoutes'
import BackupIntroScreen from '~/screens/BackupMnemonic/BackupIntroScreen'
import VerificationSuccessScreen from '~/screens/BackupMnemonic/VerificationSuccessScreen'
import VerifyMnemonicScreen from '~/screens/BackupMnemonic/VerifyMnemonicScreen'

export interface BackupMnemonicNavigationParamList extends ParamListBase {
  BackupIntroScreen: undefined
  MnemonicScreen: undefined
  VerificationSuccessScreen: undefined
}

const BackupMnemonicStack = createStackNavigator<BackupMnemonicNavigationParamList>()

const BackupMnemonicNavigation = (props: StackScreenProps<RootStackParamList, 'BackupMnemonicNavigation'>) => (
  <BackupMnemonicStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="BackupIntroScreen">
    <BackupMnemonicStack.Screen name="BackupIntroScreen" component={BackupIntroScreen} />
    <BackupMnemonicStack.Screen name="VerifyMnemonicScreen" component={VerifyMnemonicScreen} />
    <BackupMnemonicStack.Screen name="VerificationSuccessScreen" component={VerificationSuccessScreen} />
  </BackupMnemonicStack.Navigator>
)

export default BackupMnemonicNavigation
