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
import DashboardHeaderActions from '~/components/DashboardHeaderActions'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import RefreshSpinner from '~/components/RefreshSpinner'
import WalletSwitchButton from '~/components/WalletSwitchButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, selectTotalBalance, syncAddressesData } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'>,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const headerHeight = useHeaderHeight()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const totalBalance = useAppSelector(selectTotalBalance)

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
        <RefreshSpinner refreshing={isLoading} onRefresh={refreshData} progressViewOffset={headerHeight || 170} />
      }
      hasBottomBar
      verticalGap
      headerOptions={{
        headerRight: () => <DashboardHeaderActions />,
        headerLeft: () => <WalletSwitchButton />,
        headerTitle: activeWalletName
      }}
      {...props}
    >
      <BalanceAndButtons>
        <BalanceSummary dateLabel="VALUE TODAY" />
        <ButtonsRowContainer style={buttonsRowStyle}>
          <ButtonsRow sticked hasDivider={totalBalance > 0}>
            {totalBalance > 0 && (
              <Button
                onPress={() => navigation.navigate('SendNavigation')}
                iconProps={{ name: 'arrow-up-outline' }}
                title="Send"
                type="transparent"
                color={theme.global.send}
                flex
              />
            )}
            <Button
              onPress={() => navigation.navigate('ReceiveNavigation')}
              iconProps={{ name: 'arrow-down-outline' }}
              title="Receive"
              type="transparent"
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
  margin: 0 ${DEFAULT_MARGIN}px;
  margin-top: -20px;
  padding-top: 20px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom-left-radius: ${BORDER_RADIUS_BIG}px;
  border-bottom-right-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
`
