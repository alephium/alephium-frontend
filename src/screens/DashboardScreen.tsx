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
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import AddressesTokensList from '~/components/AddressesTokensList'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import DashboardHeaderActions from '~/components/DashboardHeaderActions'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import RefreshSpinner from '~/components/RefreshSpinner'
import WalletSwitchButton from '~/components/WalletSwitchButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, selectTotalBalance, syncAddressesData } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'>,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const headerHeight = useHeaderHeight()
  const walletName = useAppSelector((s) => s.wallet.name)
  const totalBalance = useAppSelector(selectTotalBalance)

  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loadingBalances)

  const buttonsRowStyle = useAnimatedStyle(() => ({
    height: withDelay(isLoading ? 100 : 800, withSpring(isLoading ? 0 : 65, defaultSpringConfiguration)),
    opacity: withDelay(isLoading ? 100 : 800, withSpring(isLoading ? 0 : 1, defaultSpringConfiguration))
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
        headerLeft: () => <WalletSwitchButton isLoading={isLoading} />,
        headerTitle: walletName
      }}
      {...props}
    >
      <BalanceAndButtons>
        <BalanceSummary dateLabel="VALUE TODAY" />
        {totalBalance > 0 && (
          <ButtonsRowContainer
            style={[
              buttonsRowStyle,
              {
                shadowColor: 'black',
                shadowOffset: { height: 5, width: 0 },
                shadowOpacity: theme.name === 'dark' ? 0.5 : 0.08,
                shadowRadius: 3
              }
            ]}
          >
            <Button
              onPress={() => navigation.navigate('SendNavigation')}
              iconProps={{ name: 'arrow-up-outline' }}
              title="Send"
              variant="highlightedIcon"
              round
              short
              flex
            />
            <Button
              onPress={() => navigation.navigate('ReceiveNavigation')}
              iconProps={{ name: 'arrow-down-outline' }}
              title="Receive"
              variant="highlightedIcon"
              round
              short
              flex
            />
          </ButtonsRowContainer>
        )}
      </BalanceAndButtons>
      <AddressesTokensList />
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(BottomBarScrollScreen)`
  gap: 15px;
`

const BalanceAndButtons = styled.View`
  flex: 1;
`

const ButtonsRowContainer = styled(Animated.View)`
  margin: 20px ${DEFAULT_MARGIN}px 10px;
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 10px;

  border-color: ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
`
