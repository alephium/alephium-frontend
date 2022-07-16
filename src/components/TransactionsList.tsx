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

import { ActivityIndicator, StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import List from '../components/List'
import TransactionRow from '../components/TransactionRow'
import { useAppSelector } from '../hooks/redux'
import { selectConfirmedTransactions } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

interface TransactionsListProps {
  addressHashes: AddressHash[]
  style?: StyleProp<ViewStyle>
}

const TransactionsList = ({ addressHashes, style }: TransactionsListProps) => {
  const allConfirmedTxs = useAppSelector((state) => selectConfirmedTransactions(state, addressHashes))
  const isAddressDataLoading = useAppSelector((state) => state.addresses.loading)
  const theme = useTheme()

  return (
    <View style={style}>
      <H2>Latest transactions</H2>
      {allConfirmedTxs.length === 0 && isAddressDataLoading ? (
        <ActivityIndicator size="large" color={theme.font.primary} />
      ) : allConfirmedTxs.length > 0 ? (
        <List>
          {allConfirmedTxs.map((tx, index) => (
            <TransactionRow
              key={`${tx.hash}-${tx.address.hash}`}
              tx={tx}
              isLast={index === allConfirmedTxs.length - 1}
            />
          ))}
        </List>
      ) : (
        <Text>No transactions</Text>
      )}
    </View>
  )
}

export default TransactionsList

const H2 = styled(Text)`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
`
