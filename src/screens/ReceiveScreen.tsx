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
import React, { useState } from 'react'
import { ScrollView } from 'react-native'

import AddressBadge from '../components/AddressBadge'
import Select from '../components/inputs/Select'
import Screen, { BottomModalScreenTitle, ScreenSection } from '../components/layout/Screen'
import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAllAddresses } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'ReceiveScreen'>

const ReceiveScreen = (props: ScreenProps) => {
  const addressEntries = useAppSelector((state) => state.addresses.entities)
  const addresses = useAppSelector(selectAllAddresses)
  const mainAddress = useAppSelector((state) => state.addresses.mainAddress)
  const [toAddress, setToAddress] = useState<AddressHash>(mainAddress)

  const addressesOptions = addresses.map((address) => ({
    value: address.hash,
    label: address.settings.label || address.hash
  }))

  const renderValue = (addressHash: AddressHash) => {
    const address = addressEntries[addressHash]

    return address ? <AddressBadge address={address} /> : null
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          <BottomModalScreenTitle>Receive</BottomModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <Select
            label="To address"
            value={toAddress}
            onValueChange={setToAddress}
            options={addressesOptions}
            renderValue={renderValue}
          />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default ReceiveScreen
