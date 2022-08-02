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
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import BalanceSummary from '../components/BalanceSummary'
import Button from '../components/buttons/Button'
import DashboardHeaderActions from '../components/DashboardHeaderActions'
import Screen from '../components/layout/Screen'
import WalletSwitch from '../components/WalletSwitch'
import { useAppDispatch } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import { deleteAllWallets } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'

type ScreenProps = StackScreenProps<InWalletTabsParamList, 'DashboardScreen'> & {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()

  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.getParent()?.navigate('LandingScreen')
  }

  return (
    <Screen style={style}>
      <ScrollView>
        <Header>
          <WalletSwitch />
          <DashboardHeaderActions />
        </Header>
        <ScreenSection>
          <BalanceSummary />
        </ScreenSection>
        <Buttons style={{ marginBottom: 120, marginTop: 500 }}>
          <Button title="Delete all wallets" onPress={handleDeleteAllWallets} />
        </Buttons>
      </ScrollView>
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
