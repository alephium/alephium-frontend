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

import { useHeaderHeight } from '@react-navigation/elements'
import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import Animated, { useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressesTokensList from '~/components/AddressesTokensList'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import RefreshSpinner from '~/components/RefreshSpinner'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, syncAddressesData } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, HORIZONTAL_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'>,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const headerHeight = useHeaderHeight()

  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loadingBalances)

  const buttonsRowStyle = useAnimatedStyle(() => ({
    height: withDelay(isLoading ? 100 : 800, withSpring(isLoading ? 0 : 75, defaultSpringConfiguration))
  }))

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  return (
    <DashboardScreenStyled
      refreshControl={
        <RefreshSpinner refreshing={isLoading} onRefresh={refreshData} progressViewOffset={headerHeight} />
      }
      hasHeader
      hasBottomBar
      {...props}
    >
      <BalanceAndButtons>
        <BalanceSummary dateLabel="VALUE TODAY" />
        <ButtonsRowContainer style={buttonsRowStyle}>
          <ButtonsRow sticked>
            <Button
              onPress={() => navigation.navigate('SendNavigation')}
              iconProps={{ name: 'arrow-up-outline' }}
              title="Send"
              type="tint"
              color={theme.global.send}
              flex
            />
            <Button
              onPress={() => navigation.navigate('ReceiveNavigation')}
              iconProps={{ name: 'arrow-down-outline' }}
              title="Receive"
              type="tint"
              color={theme.global.receive}
              flex
            />
          </ButtonsRow>
        </ButtonsRowContainer>
      </BalanceAndButtons>
      <AddressesTokensList />
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(BottomBarScrollScreen)`
  gap: ${VERTICAL_GAP}px;
`

const BalanceAndButtons = styled.View`
  flex: 1;
`

const ButtonsRowContainer = styled(Animated.View)`
  z-index: -1;
  margin: 0 ${HORIZONTAL_MARGIN}px;
  margin-top: -20px;
  padding-top: 20px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom-left-radius: ${BORDER_RADIUS_BIG}px;
  border-bottom-right-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
`
