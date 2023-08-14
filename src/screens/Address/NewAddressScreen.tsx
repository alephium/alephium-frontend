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

import { deriveNewAddressData, walletImportAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useRef, useState } from 'react'

import SpinnerModal from '~/components/SpinnerModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { NewAddressNavigationParamList } from '~/navigation/NewAddressNavigation'
import AddressForm, { AddressFormData } from '~/screens/Address/AddressForm'
import {
  newAddressGenerated,
  selectAllAddresses,
  syncAddressesData,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { getRandomLabelColor } from '~/utils/colors'
import { mnemonicToSeed } from '~/utils/crypto'

type ScreenProps = StackScreenProps<NewAddressNavigationParamList, 'NewAddressScreen'>

const NewAddressScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
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
    const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, activeWalletMnemonic)
    const newAddressData = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
    const newAddress = { ...newAddressData, settings: { label, color, isDefault } }

    await persistAddressSettings(newAddress)
    dispatch(newAddressGenerated(newAddress))
    await dispatch(syncAddressesData(newAddress.hash))
    await dispatch(syncAddressesHistoricBalances(newAddress.hash))

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <AddressForm
        initialValues={initialValues}
        onSubmit={handleGeneratePress}
        onGroupPress={() => navigation.navigate('GroupSelectScreen')}
      />
      <SpinnerModal isActive={loading} text="Generating address..." />
    </>
  )
}

export default NewAddressScreen
