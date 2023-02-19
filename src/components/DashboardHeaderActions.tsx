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
import { Eye as EyeIcon, Settings as SettingsIcon, ShieldAlert, WifiOff } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import Toast from 'react-native-root-toast'
import styled, { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { discreetModeToggled } from '../store/settingsSlice'
import { BORDER_RADIUS } from '../style/globalStyle'

interface DashboardHeaderActionsProps {
  style?: StyleProp<ViewStyle>
}

const DashboardHeaderActions = ({ style }: DashboardHeaderActionsProps) => {
  const [isMnemonicBackedUp, networkStatus] = useAppSelector((s) => [
    s.activeWallet.isMnemonicBackedUp,
    s.network.status
  ])
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const showOfflineMessage = () =>
    Toast.show('The app is offline and trying to reconnect. Please, check your network settings.')

  return (
    <View style={style}>
      {networkStatus === 'offline' && (
        <Pressable onPress={showOfflineMessage}>
          <HeaderButton>
            <WifiOff size={24} color={theme.global.alert} />
          </HeaderButton>
        </Pressable>
      )}
      <Pressable onPress={toggleDiscreetMode}>
        <HeaderButton>
          <EyeIcon size={24} color={theme.font.primary} />
        </HeaderButton>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SecurityScreen')}>
        <SecurityIcon alert={isMnemonicBackedUp === false} />
      </Pressable>
      <Pressable onPress={() => navigation.navigate('SettingsScreen')}>
        <HeaderButton>
          <SettingsIcon size={24} color={theme.font.primary} />
        </HeaderButton>
      </Pressable>
    </View>
  )
}

export default memo(styled(DashboardHeaderActions)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)

// TODO: Create standalone Icon component to allow us to define the size prop
const HeaderButton = styled.View`
  padding: 18px 12px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

interface SecurityIconProps {
  alert: boolean
}

const SecurityIcon = ({ alert }: SecurityIconProps) => {
  const theme = useTheme()
  const fgColor = alert ? theme.bg.primary : theme.font.primary
  const bgColor = alert ? theme.global.alert : 'transparent'

  return (
    <HeaderButton style={{ backgroundColor: bgColor }}>
      <ShieldAlert size={24} color={fgColor} />
    </HeaderButton>
  )
}
