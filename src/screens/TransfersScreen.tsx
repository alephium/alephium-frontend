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
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { FlatList } from 'react-native'

import AppText from '~/components/AppText'
import BaseHeader from '~/components/headers/BaseHeader'
import TransactionsFlatListScreen from '~/components/layout/TransactionsFlatListScreen'
import { useScrollContext } from '~/contexts/ScrollContext'
import useCustomHeader from '~/hooks/layout/useCustomHeader'
import useVerticalScroll from '~/hooks/layout/useVerticalScroll'
import { useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { makeSelectAddressesPendingTransactions } from '~/store/pendingTransactionsSlice'
import { HORIZONTAL_MARGIN } from '~/style/globalStyle'
import { AddressTransaction } from '~/types/transactions'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const selectAddressesConfirmedTransactions = useMemo(makeSelectAddressesConfirmedTransactions, [])
  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const confirmedTransactions = useAppSelector(selectAddressesConfirmedTransactions)
  const pendingTransactions = useAppSelector(selectAddressesPendingTransactions)

  const { handleScroll, scrollY } = useVerticalScroll()
  const { setScrollToTop } = useScrollContext()
  const headerHeight = useHeaderHeight()

  const listRef = useRef<FlatList<AddressTransaction>>(null)

  useCustomHeader({
    Header: (props) => (
      <BaseHeader
        scrollY={scrollY}
        headerTitle="Transfers"
        HeaderCompactContent={<AppText>{'Transfers'}</AppText>}
        {...props}
      />
    ),
    navigation
  })

  useEffect(() => {
    navigation.addListener('blur', () => listRef.current?.scrollToOffset({ offset: 0, animated: false }))
  }, [navigation])

  useFocusEffect(
    useCallback(
      () => setScrollToTop(() => () => listRef.current?.scrollToOffset({ offset: 0, animated: true })),
      [setScrollToTop]
    )
  )

  return (
    <TransactionsFlatListScreen
      confirmedTransactions={confirmedTransactions}
      pendingTransactions={pendingTransactions}
      initialNumToRender={8}
      contentContainerStyle={{ flexGrow: 1, paddingTop: headerHeight + HORIZONTAL_MARGIN }}
      onScroll={handleScroll}
      ref={listRef}
    />
  )
}

export default TransfersScreen
