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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Settings, ShieldAlert, WifiOff } from 'lucide-react-native'
import { memo } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import Toast from 'react-native-root-toast'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface DashboardHeaderActionsProps {
  style?: StyleProp<ViewStyle>
}

const DashboardHeaderActions = ({ style }: DashboardHeaderActionsProps) => {
  const isMnemonicBackedUp = useAppSelector((s) => s.activeWallet.isMnemonicBackedUp)
  const networkStatus = useAppSelector((s) => s.network.status)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const showOfflineMessage = () =>
    Toast.show('The app is offline and trying to reconnect. Please, check your network settings.')

  return (
    <View style={style}>
      {networkStatus === 'offline' && <Button onPress={showOfflineMessage} Icon={WifiOff} variant="alert" round />}
      <Button
        onPress={() => navigation.navigate('SecurityScreen')}
        Icon={ShieldAlert}
        variant={isMnemonicBackedUp ? 'default' : 'alert'}
        round
      />
      <Button onPress={() => navigation.navigate('SettingsScreen')} Icon={Settings} round />
    </View>
  )
}

export default memo(styled(DashboardHeaderActions)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)
