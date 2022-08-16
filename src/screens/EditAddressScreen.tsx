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

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import { addressSettingsUpdated, mainAddressChanged, selectAddressByHash } from '../store/addressesSlice'
import AddressFormScreen, { AddressFormData } from './AddressFormScreen'

type ScreenProps = StackScreenProps<RootStackParamList, 'EditAddressScreen'>

const EditAddressScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const mainAddress = useAppSelector((state) => state.addresses.mainAddress)

  if (!address) return null

  const initialValues = {
    label: address.settings.label,
    color: address.settings.color,
    isMain: address.settings.isMain,
    group: address.group
  }

  const handleSavePress = async ({ isMain, label, color }: AddressFormData) => {
    const addressSettings = {
      label,
      color,
      isMain
    }

    dispatch(
      addressSettingsUpdated({
        hash: address.hash,
        settings: addressSettings
      })
    )
    if (activeWallet.metadataId)
      await storeAddressMetadata(activeWallet.metadataId, {
        index: address.index,
        ...addressSettings
      })

    if (isMain && mainAddress !== addressHash) {
      await dispatch(mainAddressChanged(address))
    }
    navigation.goBack()
  }

  return (
    <AddressFormScreen
      initialValues={initialValues}
      onSubmit={handleSavePress}
      buttonText="Save"
      disableIsMainToggle={initialValues.isMain}
    />
  )
}

export default EditAddressScreen
