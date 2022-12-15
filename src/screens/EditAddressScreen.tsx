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
import { useState } from 'react'

import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { updateAddressSettings, selectAddressByHash } from '../store/addressesSlice'
import { AddressSettings } from '../types/addresses'
import AddressFormScreen from './AddressFormScreen'

type ScreenProps = StackScreenProps<RootStackParamList, 'EditAddressScreen'>

const EditAddressScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const [loading, setLoading] = useState(false)

  if (!address) return null

  const initialValues = { ...address.settings, group: address.group }

  const handleSavePress = async (settings: AddressSettings) => {
    setLoading(true)
    await dispatch(updateAddressSettings({ address, settings }))
    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <AddressFormScreen
        initialValues={initialValues}
        onSubmit={handleSavePress}
        buttonText="Save"
        disableIsMainToggle={initialValues.isMain}
      />
      <SpinnerModal isActive={loading} text="Saving address..." />
    </>
  )
}

export default EditAddressScreen
