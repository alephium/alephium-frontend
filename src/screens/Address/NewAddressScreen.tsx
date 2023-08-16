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
import { usePostHog } from 'posthog-react-native'
import { useRef, useState } from 'react'

import Screen, { ScreenProps } from '~/components/layout/Screen'
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

interface NewAddressScreenProps
  extends StackScreenProps<NewAddressNavigationParamList, 'NewAddressScreen'>,
    ScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const persistAddressSettings = usePersistAddressSettings()
  const posthog = usePostHog()

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

    try {
      await persistAddressSettings(newAddress)
      dispatch(newAddressGenerated(newAddress))
      await dispatch(syncAddressesData(newAddress.hash))
      await dispatch(syncAddressesHistoricBalances(newAddress.hash))

      posthog?.capture('Address: Generated new address', {
        note: group === undefined ? 'In default group' : 'In specific group'
      })
    } catch (e) {
      console.error(e)

      posthog?.capture('Error', { message: 'Could not save new address' })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <Screen {...props}>
      <AddressForm
        initialValues={initialValues}
        onSubmit={handleGeneratePress}
        onGroupPress={() => navigation.navigate('GroupSelectScreen')}
      />
      <SpinnerModal isActive={loading} text="Generating address..." />
    </Screen>
  )
}

export default NewAddressScreen
