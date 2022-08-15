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

import { deriveNewAddressData, TOTAL_NUMBER_OF_GROUPS, walletImportAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, Switch } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import ColorPicker from '../components/inputs/ColorPicker'
import Input from '../components/inputs/Input'
import Select, { SelectOption } from '../components/inputs/Select'
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

const groupSelectOptions: SelectOption<number>[] = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => ({
  value: index,
  label: `Group ${index}`
}))

const NewAddressScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState<string>(getRandomLabelColor())
  const [isMain, setIsMain] = useState(false)
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const [seed, setSeed] = useState<Buffer>()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const addressSettings = {
    isMain,
    label,
    color
  }
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const importWallet = async () => {
      const wallet = await walletImportAsyncUnsafe(mnemonicToSeed, activeWallet.mnemonic)
      setSeed(wallet.seed)
    }

    importWallet()
  }, [activeWallet.mnemonic])

  const handleGeneratePress = async () => {
    if (!seed) return

    setLoading(true)

    const newAddressData = deriveNewAddressData(seed, newAddressGroup, undefined, currentAddressIndexes.current)

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
      await storeAddressMetadata(activeWallet.metadataId, {
        index: newAddressData.addressIndex,
        ...addressSettings
      })

    setLoading(false)

    navigation.goBack()
  }

  const toggleIsMain = () => setIsMain(!isMain)

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between'
        }}
      >
        <TopContent>
          <ScreenSection>
            <Input value={label} onChangeText={setLabel} label="Label" maxLength={50} isTopRounded hasBottomBorder />
            <ColorPicker value={color} onChange={setColor} />
            <HighlightRow
              isBottomRounded
              title="Main address"
              subtitle="Default address for operations"
              onPress={toggleIsMain}
            >
              <Switch
                trackColor={{ false: theme.font.secondary, true: theme.global.accent }}
                thumbColor={theme.font.contrast}
                onValueChange={toggleIsMain}
                value={isMain}
              />
            </HighlightRow>
          </ScreenSection>
          <ScreenSection>
            <ExpandableRow expandedHeight={90}>
              <Select
                options={groupSelectOptions}
                allowEmpty
                label="Group"
                value={newAddressGroup}
                onValueChange={setNewAddressGroup}
                isTopRounded
                isBottomRounded
              />
            </ExpandableRow>
            {loading && <ActivityIndicator size="large" color={theme.font.primary} />}
          </ScreenSection>
        </TopContent>
        <BottomContent>
          <ScreenSection>
            <Button title="Generate" centered onPress={handleGeneratePress} />
          </ScreenSection>
        </BottomContent>
      </ScrollView>
    </Screen>
  )
}

export default NewAddressScreen

const ScreenSection = styled.View`
  padding: 22px 20px;
`

const TopContent = styled.View``

const BottomContent = styled.View``
