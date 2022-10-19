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
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import DefaultHeader, { DefaultHeaderProps } from '../components/headers/DefaultHeader'
import InWalletFlatList from '../components/layout/InWalletFlatList'
import { ScreenSectionTitle } from '../components/layout/Screen'
import TransactionRow from '../components/TransactionRow'
import useInWalletTabScreenHeader from '../hooks/layout/useInWalletTabScreenHeader'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressIds, selectTransactions } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { AddressTransaction } from '../types/transactions'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreenHeader = (props: Partial<DefaultHeaderProps>) => (
  <DefaultHeader HeaderLeft="Transfers" {...props} />
)

const transactionKeyExtractor = (tx: AddressTransaction) => `${tx.hash}-${tx.address.hash}-${tx.blockHash}`

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const txs = useAppSelector((state) => selectTransactions(state, addressHashes))
  const updateHeader = useInWalletTabScreenHeader(TransfersScreenHeader, navigation)
  const theme = useTheme()

  const renderTransactionItem = ({ item: tx, index }: { item: AddressTransaction; index: number }) => (
    <TransactionRowStyled
      key={transactionKeyExtractor(tx)}
      tx={tx}
      isFirst={index === 0}
      isLast={index === txs.length - 1}
    />
  )

  return (
    <InWalletFlatList
      data={txs}
      renderItem={renderTransactionItem}
      keyExtractor={transactionKeyExtractor}
      onScrollYChange={updateHeader}
      initialNumToRender={8}
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponent={<ScreenSectionTitleStyled>Latest transactions</ScreenSectionTitleStyled>}
      ListEmptyComponent={
        <Placeholder>
          <AppText color={theme.font.tertiary} bold>
            No transactions yet
          </AppText>
        </Placeholder>
      }
    />
  )
}

export default TransfersScreen

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
  margin-top: 22px;
`

const TransactionRowStyled = styled(TransactionRow)`
  margin: 0 20px;
`

const Placeholder = styled.View`
  flex: 1;
  margin-top: 200px;
  align-items: center;
`
