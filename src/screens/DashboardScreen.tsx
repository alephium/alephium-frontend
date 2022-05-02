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
import { useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import RootStackParamList from '../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'DashboardScreen'>

const DashboardScreen = ({ navigation }: ScreenProps) => {
  const { wallet, walletName, settings } = useGlobalContext()
  const { addresses } = useAddressesContext()
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))

  return (
    <Screen>
      <Text>Wallet name:</Text>
      <Bold>{walletName}</Bold>
      <Text>Primary wallet address:</Text>
      <Bold>{wallet?.address}</Bold>
      <Text>Settings:</Text>
      <Bold>{JSON.stringify(settings)}</Bold>
      <Text>Addresses:</Text>
      {addresses.map((address) => (
        <Bold key={address.hash}>{address.hash}</Bold>
      ))}
      <Text>Total balance:</Text>
      <Bold>{totalBalance.toString()}</Bold>
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
