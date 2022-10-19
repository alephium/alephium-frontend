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

import DefaultHeader, { DefaultHeaderProps } from '../components/headers/DefaultHeader'
import InWalletTransactionsFlatList from '../components/layout/InWalletTransactionsFlatList'
import useInWalletTabScreenHeader from '../hooks/layout/useInWalletTabScreenHeader'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressIds, selectHaveAllPagesLoaded, selectTransactions } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreenHeader = (props: Partial<DefaultHeaderProps>) => (
  <DefaultHeader HeaderLeft="Transfers" {...props} />
)

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const txs = useAppSelector((state) => selectTransactions(state, addressHashes))
  const updateHeader = useInWalletTabScreenHeader(TransfersScreenHeader, navigation)
  const haveAllPagesLoaded = useAppSelector((state) => selectHaveAllPagesLoaded(state))

  return (
    <InWalletTransactionsFlatList
      transactions={txs}
      addressHashes={addressHashes}
      haveAllPagesLoaded={haveAllPagesLoaded}
      onScrollYChange={updateHeader}
      initialNumToRender={8}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  )
}

export default TransfersScreen
