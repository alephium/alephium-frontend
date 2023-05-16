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

import TransactionsFlatListScreen from '../components/layout/TransactionsFlatListScreen'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressIds, selectHaveAllPagesLoaded } from '../store/addressesSlice'
import { selectAddressesConfirmedTransactions } from '../store/confirmedTransactionsSlice'
import { selectAddressesPendingTransactions } from '../store/pendingTransactionsSlice'
import { AddressHash } from '../types/addresses'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const [confirmedTransactions, pendingTransactions, haveAllPagesLoaded] = useAppSelector((s) => [
    selectAddressesConfirmedTransactions(s, addressHashes),
    selectAddressesPendingTransactions(s, addressHashes),
    selectHaveAllPagesLoaded(s)
  ])

  return (
    <TransactionsFlatListScreen
      confirmedTransactions={confirmedTransactions}
      pendingTransactions={pendingTransactions}
      addressHashes={addressHashes}
      haveAllPagesLoaded={haveAllPagesLoaded}
      initialNumToRender={8}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  )
}

export default TransfersScreen
