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

import { ActivityIndicator, FlatListProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { fetchAddressesDataNextPage } from '../../store/addressesSlice'
import { AddressHash } from '../../types/addresses'
import { AddressTransaction } from '../../types/transactions'
import AppText from '../AppText'
import TransactionRow from '../TransactionRow'
import InWalletFlatList from './InWalletFlatList'
import { ScreenSectionTitle } from './Screen'

interface InWalletTransactionsFlatListProps extends Partial<FlatListProps<AddressTransaction>> {
  transactions: AddressTransaction[]
  addressHashes: AddressHash[]
  haveAllPagesLoaded: boolean
  onScrollYChange: (scrollY: number) => void
}

const transactionKeyExtractor = (tx: AddressTransaction) => `${tx.hash}-${tx.address.hash}-${tx.blockHash}`

const InWalletTransactionsFlatList = ({
  transactions,
  addressHashes,
  haveAllPagesLoaded,
  ListHeaderComponent,
  ...props
}: InWalletTransactionsFlatListProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((state) => state.addresses.loading)

  const renderTransactionItem = ({ item: tx, index }: { item: AddressTransaction; index: number }) => (
    <TransactionRowStyled
      key={transactionKeyExtractor(tx)}
      tx={tx}
      isFirst={index === 0}
      isLast={index === transactions.length - 1}
    />
  )

  const fetchNextTransactionsPage = () => {
    if (!isLoading && !haveAllPagesLoaded) {
      dispatch(fetchAddressesDataNextPage(addressHashes))
    }
  }

  return (
    <InWalletFlatList
      {...props}
      data={transactions}
      renderItem={renderTransactionItem}
      keyExtractor={transactionKeyExtractor}
      onEndReached={fetchNextTransactionsPage}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          <ScreenSectionTitleStyled>Latest transactions</ScreenSectionTitleStyled>
        </>
      }
      ListFooterComponent={
        <Footer>
          {haveAllPagesLoaded && transactions.length > 0 && (
            <AppText color={theme.font.tertiary} bold>
              👏 You reached the end of history!
            </AppText>
          )}
          {!haveAllPagesLoaded && isLoading && <ActivityIndicator size="large" color={theme.font.primary} />}
          {transactions.length === 0 && !isLoading && (
            <AppText color={theme.font.tertiary} bold>
              No transactions yet!
            </AppText>
          )}
        </Footer>
      }
    />
  )
}

export default InWalletTransactionsFlatList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
  margin-top: 22px;
`

const TransactionRowStyled = styled(TransactionRow)`
  margin: 0 20px;
`

const Footer = styled.View`
  padding-top: 40px;
  padding-bottom: 150px;
  align-items: center;
`
