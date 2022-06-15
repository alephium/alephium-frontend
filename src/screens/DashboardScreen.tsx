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
import {
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  Eye as EyeIcon,
  Settings2 as SettingsIcon,
  ShieldAlert as SecurityIcon
} from 'lucide-react-native'
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import BalanceSummary from '../components/BalanceSummary'
import Button from '../components/buttons/Button'
import FooterMenu from '../components/FooterMenu'
import Screen from '../components/layout/Screen'
import TransactionsList from '../components/TransactionsList'
import WalletSwitch from '../components/WalletSwitch'
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
  const theme = useTheme()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const addresses = useAppSelector(selectAllAddresses)

  const dispatch = useAppDispatch()

  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.navigate('LandingScreen')
  }

  const toggleDiscreetMode = () => {
    dispatch(discreetModeChanged(!discreetMode))
  }

  console.log('DashboardScreen renders')

  return (
    <Screen style={style}>
      <ScrollView>
        <Header>
          <WalletSwitch />
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
          <BalanceSummary />
          <Buttons>
            <SendButton>
              <ArrowUpIcon size={24} color={theme.font.contrast} />
              <ButtonText>Send</ButtonText>
            </SendButton>
            <ReceiveButton>
              <ArrowDownIcon size={24} color={theme.font.contrast} />
              <ButtonText>Receive</ButtonText>
            </ReceiveButton>
          </Buttons>
        </ScreenSection>
        <ScreenSection>
          <TransactionsList addresses={addresses} />
        </ScreenSection>
        <Buttons style={{ marginBottom: 120 }}>
          <Button title="Delete all wallets" onPress={handleDeleteAllWallets} />
        </Buttons>
      </ScrollView>
      <FooterMenu />
    </Screen>
  )
}

export default styled(DashboardScreen)`
  padding-top: 30px;
`

const Buttons = styled.View`
  display: flex;
  flex-direction: row;
`
const IconedButton = styled(Button)`
  flex-direction: row;
`

const SendButton = styled(IconedButton)`
  flex: 1;
  margin-right: 5px;
`

const ReceiveButton = styled(IconedButton)`
  flex: 1;
  margin-left: 5px;
`

const ButtonText = styled(Text)`
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  margin-left: 10px;
`

const ScreenSection = styled(View)`
  padding: 22px 20px;

  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
`

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 22px 20px 18px;
`

const Actions = styled(View)`
  flex-direction: row;
  align-items: center;
`

const Icon = styled(View)`
  padding: 18px 12px;
`
