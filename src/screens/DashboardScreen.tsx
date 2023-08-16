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
import { ArrowDown, ArrowUp } from 'lucide-react-native'
import React from 'react'
import { RefreshControl } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressesTokensList from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useScrollEventHandler } from '~/contexts/ScrollContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds, syncAddressesData } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'DashboardScreen'>,
    ScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loadingBalances)
  const scrollHandler = useScrollEventHandler()

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  return (
    <ScrollScreen
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      onScroll={scrollHandler}
      {...props}
    >
      <ScreenSectionStyled>
        <BalanceSummaryStyled dateLabel="VALUE TODAY" />
      </ScreenSectionStyled>
      <ScreenSection>
        <ButtonsRow>
          <SendReceiveButton type="transparent" round onPress={() => navigation.navigate('SendNavigation')}>
            <ButtonText semiBold>Send</ButtonText>
            <Icon>
              <ArrowUp color={theme.font.secondary} size={20} />
            </Icon>
          </SendReceiveButton>
          <SendReceiveButton type="transparent" round onPress={() => navigation.navigate('ReceiveNavigation')}>
            <ButtonText semiBold>Receive</ButtonText>
            <Icon>
              <ArrowDown color={theme.font.secondary} size={20} />
            </Icon>
          </SendReceiveButton>
        </ButtonsRow>
      </ScreenSection>
      <AddressesTokensList />
    </ScrollScreen>
  )
}

export default DashboardScreen

const ScreenSectionStyled = styled(ScreenSection)`
  padding-bottom: 0;
  padding-top: 0;
`

const BalanceSummaryStyled = styled(BalanceSummary)`
  padding: 0px 15px 0px;
`

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 15px;
`

const SendReceiveButton = styled(Button)`
  flex: 1;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.primary};
  padding: 8.5px 10px;
  height: auto;
`

const Icon = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 100px;
  padding: 6px;
  margin-left: auto;
`

const ButtonText = styled(AppText)`
  flex: 1;
  text-align: center;
`
