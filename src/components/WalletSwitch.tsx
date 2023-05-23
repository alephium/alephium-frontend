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
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import AppText from './AppText'
import Button from './buttons/Button'

interface WalletSwitchProps {
  style?: StyleProp<ViewStyle>
}

const WalletSwitch = ({ style }: WalletSwitchProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  return (
    <Button style={style} variant="contrast" onPress={() => navigation.navigate('SwitchWalletScreen')}>
      <WalletName numberOfLines={1}>{activeWalletName.slice(0, 2).toUpperCase()}</WalletName>
    </Button>
  )
}

export default memo(styled(WalletSwitch)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 50px;
`)

const WalletName = styled(AppText)`
  font-weight: 700;
`
