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

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowDown, ArrowUp } from 'lucide-react-native'
import React from 'react'
import { RefreshControl, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressesTokensList from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useScrollEventHandler } from '~/contexts/ScrollContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, syncAddressesData } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, HORIZONTAL_MARGIN } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'> {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const scrollHandler = useScrollEventHandler()
  const headerheight = useHeaderHeight()
  const bottomBarHeight = useBottomTabBarHeight()

  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loadingBalances)

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  return (
    <DashboardScreenStyled
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      onScroll={scrollHandler}
      style={{ marginTop: headerheight + HORIZONTAL_MARGIN, marginBottom: bottomBarHeight + HORIZONTAL_MARGIN }}
    >
      <View>
        <BalanceSummary dateLabel="VALUE TODAY" />
        <ButtonsRow>
          <SendReceiveButton onPress={() => navigation.navigate('SendNavigation')}>
            <ButtonText semiBold>Send</ButtonText>

            <ArrowUp color={theme.font.secondary} size={20} />
          </SendReceiveButton>
          <SendReceiveButton onPress={() => navigation.navigate('ReceiveNavigation')}>
            <ButtonText semiBold>Receive</ButtonText>

            <ArrowDown color={theme.font.secondary} size={20} />
          </SendReceiveButton>
        </ButtonsRow>
      </View>
      <AddressesTokensList />
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(ScrollScreen)`
  gap: 30px;
`

const ButtonsRow = styled(ScreenSection)`
  flex-direction: row;
  gap: 15px;
  padding: 15px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-bottom-left-radius: ${BORDER_RADIUS_BIG}px;
  border-bottom-right-radius: ${BORDER_RADIUS_BIG}px;
  margin-top: -10px;
  padding-top: 25px;
  z-index: -1;
`

const SendReceiveButton = styled(Button)`
  flex: 1;
  padding: 8.5px 10px;
  height: auto;
`

const ButtonText = styled(AppText)`
  flex: 1;
  text-align: center;
`
