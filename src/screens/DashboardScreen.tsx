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

import { formatAmountForDisplay } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { Text } from 'react-native'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteAllWallets } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'
import { selectAllAddresses } from '../store/addressesSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'DashboardScreen'>

const DashboardScreen = ({ navigation }: ScreenProps) => {
  const [usdPrice, setUsdPrice] = useState(0)
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const addresses = useAppSelector(selectAllAddresses)
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.networkData.details.balance), BigInt(0))
  const balanceFormatted = formatAmountForDisplay(totalBalance)
  const balanceInUsd = usdPrice * parseFloat(balanceFormatted)
  const dispatch = useAppDispatch()

  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.navigate('LandingScreen')
  }

  const fetchPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=alephium&vs_currencies=usd')
      const data = await response.json()
      setUsdPrice(data.alephium.usd)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPrice()
  })

  console.log('DashboardScreen renders')

  return (
    <Screen>
      <Text>Wallet name:</Text>
      <Bold>{activeWallet.name}</Bold>
      <Text>Total balance:</Text>
      <Bold>
        {balanceFormatted} ALPH ({balanceInUsd.toFixed(2)} USD)
      </Bold>
      <Button title="Delete all wallets to test fresh install" onPress={handleDeleteAllWallets} />
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
