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
import { Text } from 'react-native'
import styled from 'styled-components/native'

import Screen from '../components/layout/Screen'
import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'DashboardScreen'>

const DashboardScreen = ({ navigation }: ScreenProps) => {
  const activeWalletName = useAppSelector((state) => state.activeWallet.name)
  const activeWalletAddress = useAppSelector((state) => state.activeWallet.primaryAddress)

  console.log('DashboardScreen renders')

  return (
    <Screen>
      <Text>Wallet name:</Text>
      <Bold>{activeWalletName}</Bold>
      <Text>Primary wallet address:</Text>
      <Bold>{activeWalletAddress}</Bold>
    </Screen>
  )
}

const Bold = styled.Text`
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  padding-bottom: 20px;
`

export default DashboardScreen
