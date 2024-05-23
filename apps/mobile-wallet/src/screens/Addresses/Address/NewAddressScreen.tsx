/*
Copyright 2018 - 2024 The Alephium Authors
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

import { keyring } from '@alephium/keyring'
import { StackScreenProps } from '@react-navigation/stack'
import { useRef, useState } from 'react'

import { sendAnalytics } from '~/analytics'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import AddressFormBaseScreen, { AddressFormData } from '~/screens/Addresses/Address/AddressFormBaseScreen'
import { newAddressGenerated, selectAllAddresses, syncLatestTransactions } from '~/store/addressesSlice'
import { getRandomLabelColor } from '~/utils/colors'

interface NewAddressScreenProps extends StackScreenProps<RootStackParamList, 'NewAddressScreen'>, ScrollScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const persistAddressSettings = usePersistAddressSettings()

  const [loading, setLoading] = useState(false)

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isDefault: false
  }

  const handleGeneratePress = async ({ isDefault, label, color, group }: AddressFormData) => {
    setLoading(true)

    try {
      await initializeKeyringWithStoredWallet()
      const newAddress = {
        ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes.current }),
        settings: { label, color, isDefault }
      }
      keyring.clearAll()

      await persistAddressSettings(newAddress)
      dispatch(newAddressGenerated(newAddress))
      await dispatch(syncLatestTransactions(newAddress.hash))

      sendAnalytics('Address: Generated new address', {
        note: group === undefined ? 'In random group' : 'In specific group'
      })
    } catch (e) {
      console.error(e)

      sendAnalytics('Error', { message: 'Could not save new address' })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <AddressFormBaseScreen
        screenTitle="New address"
        initialValues={initialValues}
        onSubmit={handleGeneratePress}
        allowGroupSelection
      />
      <SpinnerModal isActive={loading} text="Generating address..." />
    </>
  )
}

export default NewAddressScreen
