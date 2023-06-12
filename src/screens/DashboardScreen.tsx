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
import React from 'react'
import { RefreshControl, StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AddressesTokensList from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, syncAddressesData } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'
import { NetworkStatus } from '~/types/network'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'> {
  style?: StyleProp<ViewStyle>
}

const DashboardScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loading)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const networkStatus = useAppSelector((s) => s.network.status)
  const networkName = useAppSelector((s) => s.network.name)

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  return (
    <DashboardScreenStyled refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}>
      <ScreenSectionStyled>
        <SurfaceHeader>
          <AppText color="primary" semiBold size={30}>
            {activeWalletName}
          </AppText>
          <ActiveNetwork>
            <NetworkStatusBullet status={networkStatus} />
            <AppText color="primary">{networkName}</AppText>
          </ActiveNetwork>
        </SurfaceHeader>

        <BalanceSummaryStyled dateLabel="VALUE TODAY" />
      </ScreenSectionStyled>
      <AddressesTokensListStyled />
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(ScrollScreen)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const AddressesTokensListStyled = styled(AddressesTokensList)`
  background-color: ${({ theme }) => theme.bg.back1};
`

const ScreenSectionStyled = styled(ScreenSection)`
  padding-bottom: 0;
`

const SurfaceHeader = styled.View`
  padding: 15px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ActiveNetwork = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 6px 8px;
  border-radius: 33px;
  background-color: ${({ theme }) => theme.bg.back1};
`

const NetworkStatusBullet = styled.View<{ status: NetworkStatus }>`
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background-color: ${({ status, theme }) => (status === 'online' ? theme.global.valid : theme.global.alert)};
`

const BalanceSummaryStyled = styled(BalanceSummary)`
  padding: 34px 15px 0px;
`
