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
import { useMemo, useRef } from 'react'
import { FlatList } from 'react-native'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import TransactionsFlatList from '~/components/layout/TransactionsFlatList'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useNavigationScrollHandler from '~/hooks/layout/useNavigationScrollHandler'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import useScrollToTopOnBlur from '~/hooks/layout/useScrollToTopOnBlur'
import { useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { makeSelectAddressesPendingTransactions } from '~/store/pendingTransactionsSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { AddressTransaction } from '~/types/transactions'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const listRef = useRef<FlatList<AddressTransaction>>(null)

  const selectAddressesConfirmedTransactions = useMemo(makeSelectAddressesConfirmedTransactions, [])
  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const confirmedTransactions = useAppSelector(selectAddressesConfirmedTransactions)
  const pendingTransactions = useAppSelector(selectAddressesPendingTransactions)

  const scrollEndHandler = useAutoScrollOnDragEnd(listRef)

  useNavigationScrollHandler(listRef)
  useScrollToTopOnBlur(listRef)

  const { screenScrollY, screenHeaderHeight, screenScrollHandler, screenHeaderLayoutHandler } = useScreenScrollHandler()

  return (
    <Screen contrastedBg>
      <TransactionsFlatList
        confirmedTransactions={confirmedTransactions}
        pendingTransactions={pendingTransactions}
        initialNumToRender={8}
        contentContainerStyle={{ flexGrow: 1, paddingTop: screenHeaderHeight + DEFAULT_MARGIN }}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        ref={listRef}
        headerHeight={screenHeaderHeight}
      />

      <BaseHeader options={{ headerTitle: 'Transfers' }} scrollY={screenScrollY} onLayout={screenHeaderLayoutHandler} />
    </Screen>
  )
}

export default TransfersScreen
