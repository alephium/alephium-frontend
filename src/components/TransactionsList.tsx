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

import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import List from '../components/List'
import TransactionRow from '../components/TransactionRow'
import { Address } from '../store/addressesSlice'

interface TransactionsListProps {
  addresses: Address[]
  style?: StyleProp<ViewStyle>
}

const TransactionsList = ({ addresses, style }: TransactionsListProps) => {
  const allConfirmedTxs = addresses
    .map((address) => address.networkData.transactions.confirmed.map((tx) => ({ ...tx, address })))
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)

  return (
    <View style={style}>
      <H2>Latest transactions</H2>
      <List>
        {allConfirmedTxs.map((tx, index) => (
          <TransactionRow key={tx.hash} tx={tx} isLast={index === allConfirmedTxs.length - 1} />
        ))}
      </List>
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
