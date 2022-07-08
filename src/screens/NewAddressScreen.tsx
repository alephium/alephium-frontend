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

import {
  AddressAndKeys,
  addressToGroup,
  deriveNewAddressData,
  TOTAL_NUMBER_OF_GROUPS,
  walletImportAsyncUnsafe
} from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import ColoredLabelInput, { ColoredLabelInputValue } from '../components/inputs/ColoredLabelInput'
import Screen from '../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import {
  addressesAdded,
  fetchAddressConfirmedTransactions,
  fetchAddressesData,
  selectAllAddresses
} from '../store/addressesSlice'
import { getRandomLabelColor } from '../utils/colors'
import { mnemonicToSeed } from '../utils/crypto'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewAddressScreen'>

const groupSelectOptions = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => ({
  value: index,
  label: `Group ${index}`
}))

const NewAddressScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [newAddressData, setNewAddressData] = useState<AddressAndKeys>()
  const [coloredLabel, setColoredLabel] = useState<ColoredLabelInputValue>({
    label: '',
    color: getRandomLabelColor()
  })
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const [seed, setSeed] = useState<Buffer>()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const addressSettings = {
    isMain: false,
    label: coloredLabel?.label,
    color: coloredLabel?.color
  }

  useEffect(() => {
    const wallet = await walletImportAsyncUnsafe(mnemonicToSeed, activeWallet.mnemonic)
    setSeed(wallet.seed)
    generateNewAddress(wallet.seed)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateNewAddress = (seed?: Buffer, inGroup?: number) => {
    if (!seed) return
    const data = deriveNewAddressData(seed, inGroup, undefined, currentAddressIndexes.current)
    setNewAddressData(data)
    setNewAddressGroup(inGroup ?? addressToGroup(data.address, TOTAL_NUMBER_OF_GROUPS))
  }

  const handleGeneratePress = () => {
    if (!newAddressData) return

    dispatch(
      addressesAdded([
        {
          hash: newAddressData.address,
          publicKey: newAddressData.publicKey,
          privateKey: newAddressData.privateKey,
          index: newAddressData.addressIndex,
          settings: addressSettings
        }
      ])
    )
    dispatch(fetchAddressesData([newAddressData.address]))
    dispatch(fetchAddressConfirmedTransactions({ hash: newAddressData.address, page: 1 }))
    if (activeWallet.metadataId)
      storeAddressMetadata(activeWallet.metadataId, {
        index: newAddressData.addressIndex,
        ...addressSettings
      })
    navigation.goBack()
  }

  const handleGroupSelect = (value: number) => {
    if (value !== newAddressGroup) {
      generateNewAddress(seed, value)
    }
  }

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          <ColoredLabelInput value={coloredLabel} onChange={setColoredLabel} />
          <RNPickerSelect
            onValueChange={handleGroupSelect}
            value={newAddressGroup}
            items={groupSelectOptions}
            placeholder={{}}
            InputAccessoryView={() => null}
            style={pickerSelectStyles}
          />
          <Button title="Generate" onPress={handleGeneratePress} style={{ marginTop: 20 }} />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default NewAddressScreen

const ScreenSection = styled(View)`
  padding: 22px 20px;
`

// copied from https://snack.expo.dev/@lfkwtz/react-native-picker-select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginTop: 20
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginTop: 20
  }
})
