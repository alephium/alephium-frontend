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
import { useMemo, useRef, useState } from 'react'
import { FlatList } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import TransactionsFlatListScreen from '~/components/layout/TransactionsFlatListScreen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenNavigationScrollHandler from '~/hooks/layout/useScreenNavigationScrollHandler'
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

  useScreenNavigationScrollHandler(listRef)
  useScrollToTopOnBlur(listRef)

  const [fullHeaderHeight, setFullHeaderHeight] = useState(0)
  const scrollY = useSharedValue(0)

  return (
    <Screen>
      <TransactionsFlatListScreen
        confirmedTransactions={confirmedTransactions}
        pendingTransactions={pendingTransactions}
        initialNumToRender={8}
        contentContainerStyle={{ flexGrow: 1, paddingTop: fullHeaderHeight + DEFAULT_MARGIN }}
        onScroll={(e) => (scrollY.value = e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={scrollEndHandler}
        ref={listRef}
        headerHeight={fullHeaderHeight}
      />

      <BaseHeader
        options={{ headerTitle: 'Transfers' }}
        scrollY={scrollY}
        onLayout={(e) => setFullHeaderHeight(e.nativeEvent.layout.height)}
      />
    </Screen>
  )
}

export default TransfersScreen
