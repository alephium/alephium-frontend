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
import {
  Eye as EyeIcon,
  MoreVertical as DotsIcon,
  Settings2 as SettingsIcon,
  ShieldAlert as SecurityIcon
} from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import Button from '../components/buttons/Button'
import FooterMenu from '../components/FooterMenu'
import Screen from '../components/layout/Screen'
import List from '../components/List'
import TransactionRow from '../components/TransactionRow'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deleteAllWallets } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'
import { selectAllAddresses } from '../store/addressesSlice'
import { discreetModeChanged } from '../store/settingsSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'DashboardScreen'> & {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const [usdPrice, setUsdPrice] = useState(0)
  const theme = useTheme()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const addresses = useAppSelector(selectAllAddresses)
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.networkData.details.balance), BigInt(0))
  const balanceFormatted = formatAmountForDisplay(totalBalance)
  const balanceInUsd = usdPrice * parseFloat(balanceFormatted)
  const allConfirmedTxs = addresses
    .map((address) => address.networkData.transactions.confirmed.map((tx) => ({ ...tx, address })))
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)
  const dispatch = useAppDispatch()

  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.navigate('LandingScreen')
  }

  const toggleDiscreetMode = () => {
    dispatch(discreetModeChanged(!discreetMode))
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
  }, [])

  console.log('DashboardScreen renders')

  return (
    <Screen style={style}>
      <ScrollView>
        <Header>
          <ButtonStyled variant="contrast" onPress={() => navigation.navigate('SwitchWalletScreen')}>
            {/* TODO: Figure out how to fix the position of the dots to the right, no matter the length of the wallet name */}
            <WalletName numberOfLines={1}>{activeWallet.name}</WalletName>
            <DotsIcon size={24} color={theme.font.primary} />
          </ButtonStyled>
          <Actions>
            <Pressable onPress={toggleDiscreetMode}>
              <Icon>
                <EyeIcon size={24} color={theme.font.primary} />
              </Icon>
            </Pressable>
            <Pressable>
              <Icon>
                <SecurityIcon size={24} color={theme.font.primary} />
              </Icon>
            </Pressable>
            <Pressable>
              <Icon>
                <SettingsIcon size={24} color={theme.font.primary} />
              </Icon>
            </Pressable>
          </Actions>
        </Header>
        <ScreenSection>
          <AmountInUsd fiat={balanceInUsd} fadeDecimals suffix="$" />
          <AmountStyled value={totalBalance} fadeDecimals />
          <Buttons>
            <SendButton title="Send" />
            <ReceiveButton title="Receive" />
          </Buttons>
        </ScreenSection>
        <ScreenSection>
          <H2>Latest transactions</H2>
          <List>
            {allConfirmedTxs.map((tx, index) => (
              <TransactionRow key={tx.hash} tx={tx} isLast={index === allConfirmedTxs.length - 1} />
            ))}
          </List>
        </ScreenSection>
        <Buttons style={{ marginBottom: 120 }}>
          <Button title="Delete all wallets" onPress={handleDeleteAllWallets} />
        </Buttons>
      </ScrollView>
      <FooterMenu />
    </Screen>
  )
}

const AmountInUsd = styled(Amount)`
  font-weight: bold;
  font-size: 38px;
  margin-bottom: 10px;
`

const AmountStyled = styled(Amount)`
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 40px;
`

const Buttons = styled.View`
  display: flex;
  flex-direction: row;
`

const SendButton = styled(Button)`
  flex: 1;
  margin-right: 5px;
`

const ReceiveButton = styled(Button)`
  flex: 1;
  margin-left: 5px;
`

const H2 = styled.Text`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
`

const ScreenSection = styled(View)`
  padding: 22px 20px;

  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
`

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: 22px 20px 18px;
`

const ButtonStyled = styled(Button)`
  width: 50%;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px;
  height: auto;
`

const WalletName = styled(Text)`
  font-weight: 600;
`

const Actions = styled(View)`
  flex-direction: row;
  align-items: center;
`

const Icon = styled(View)`
  padding: 18px 12px;
`

export default styled(DashboardScreen)`
  padding-top: 30px;
`
