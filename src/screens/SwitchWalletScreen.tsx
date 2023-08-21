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
import { CardStyleInterpolators, StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import { Alert, BackHandler } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SwitchWalletBase from '~/screens/SwitchWalletBase'

export interface SwitchWalletScreenProps
  extends StackScreenProps<RootStackParamList, 'SwitchWalletScreen'>,
    ScreenProps {}

const SwitchWalletScreen = ({ navigation, route: { params }, ...props }: SwitchWalletScreenProps) => {
  const insets = useSafeAreaInsets()

  useFocusEffect(
    useCallback(() => {
      if (params?.disableBack) {
        navigation.setOptions({
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
          gestureEnabled: false
        })

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton)

        return subscription.remove
      }
    }, [navigation, params?.disableBack])
  )

  const handleBackButton = () => {
    Alert.alert('Select a wallet', 'Please, select a wallet to continue')

    return true
  }

  return (
    <Screen {...props} style={{ paddingTop: insets.top }}>
      <SwitchWalletBase />
    </Screen>
  )
}

export default SwitchWalletScreen
