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
import { useContext } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import BalanceSummary from '../components/BalanceSummary'
import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import InWalletLayoutContext from '../contexts/InWalletLayoutContext'
import { useAppDispatch } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import { deleteAllWallets } from '../storage/wallets'
import { walletFlushed } from '../store/activeWalletSlice'

type ScreenProps = StackScreenProps<InWalletTabsParamList, 'DashboardScreen'> & {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const { scrollY } = useContext(InWalletLayoutContext)

  const handleDeleteAllWallets = () => {
    deleteAllWallets()
    dispatch(walletFlushed())
    navigation.getParent()?.navigate('LandingScreen')
  }

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y
  }

  return (
    <Screen style={style}>
      <ScrollView onScroll={handleScroll}>
        <ScreenSection>
          <BalanceSummary />
        </ScreenSection>
        <ScreenSection>
          <BalanceSummary />
        </ScreenSection>
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

const Buttons = styled.View`
  display: flex;
  flex-direction: row;
`

const ScreenSection = styled(View)`
  padding: 22px 20px;
  border-bottom-color: ${({ theme }) => theme.border.secondary};
  border-bottom-width: 1px;
`

export default DashboardScreen
