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

import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import TransactionRow from '../components/TransactionRow'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import useInterval from '../hooks/useInterval'
import { fetchAddressesDataPage, selectTransactions } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

// TODO: Pull this from an explorer endpoint
const averageBlockTime = 1000 * 30

interface TransactionsListProps {
  addressHashes: AddressHash[]
  style?: StyleProp<ViewStyle>
}

const TransactionsList = ({ addressHashes, style }: TransactionsListProps) => {
  const dispatch = useAppDispatch()
  const txs = useAppSelector((state) => selectTransactions(state, addressHashes))
  const isAddressDataLoading = useAppSelector((state) => state.addresses.loading)
  const theme = useTheme()

  useInterval(() => {
    dispatch(fetchAddressesDataPage({ addresses: addressHashes, page: 1 }))
  }, averageBlockTime)

  return (
    <View style={style}>
      <Heading>
        <H2>Latest transactions</H2>
        {isAddressDataLoading && <ActivityIndicator size="small" color={theme.font.primary} />}
      </Heading>
      {txs.length === 0 && isAddressDataLoading ? (
        <ActivityIndicator size="large" color={theme.font.primary} />
      ) : txs.length > 0 ? (
        <View>
          {txs.map((tx, index) => (
            <TransactionRow
              key={`${tx.hash}-${tx.address.hash}`}
              tx={tx}
              isFirst={index === 0}
              isLast={index === txs.length - 1}
            />
          ))}
        </View>
      ) : (
        <AppText>No transactions</AppText>
      )}
    </View>
  )
}

export default TransactionsList

const H2 = styled(AppText)`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: bold;
  font-size: 16px;
`

const Heading = styled(View)`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  margin-right: 20px;
  margin-bottom: 24px;
`
