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
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from 'lucide-react-native'
import { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import InWalletScrollScreen from '../components/layout/InWalletScrollScreen'
import { ScreenSection } from '../components/layout/Screen'
import TransactionsList from '../components/TransactionsList'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressIds } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'TransfersScreen'>

const TransfersScreen = ({ navigation }: ScreenProps) => {
  const theme = useTheme()
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  return (
    <InWalletScrollScreen>
      <ScreenSection>
        <ButtonsRow>
          <Button title="Send" icon={<ArrowUpIcon size={24} color={theme.font.contrast} />} />
          <Button
            title="Receive"
            icon={<ArrowDownIcon size={24} color={theme.font.contrast} />}
            onPress={() => navigation.navigate('ReceiveScreen')}
          />
        </ButtonsRow>
      </ScreenSection>
      <ScreenSection>
        <TransactionsList addressHashes={addressHashes} />
      </ScreenSection>
    </InWalletScrollScreen>
  )
}

export default TransfersScreen
