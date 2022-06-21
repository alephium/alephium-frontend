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
import { ScrollView, View } from 'react-native'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import ColoredLabelInput, { ColoredLabelInputValue } from '../components/inputs/ColoredLabelInput'
import Screen from '../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import { addressSettingsUpdated } from '../store/addressesSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'EditAddressScreen'>

const EditAddressScreen = ({
  navigation,
  route: {
    params: { address }
  }
}: ScreenProps) => {
  const [coloredLabel, setColoredLabel] = useState<ColoredLabelInputValue>({
    label: address.settings.label ?? '',
    color: address.settings.color ?? ''
  })
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const addressSettings = {
    isMain: address.settings.isMain,
    label: coloredLabel?.label,
    color: coloredLabel?.color
  }

  const dispatch = useAppDispatch()

  const handleSavePress = () => {
    if (coloredLabel.color === address.settings.color && coloredLabel.label === address.settings.label) return

    dispatch(
      addressSettingsUpdated({
        hash: address.hash,
        settings: addressSettings
      })
    )
    if (activeWallet.metadataId)
      storeAddressMetadata(activeWallet.metadataId, {
        index: address.index,
        ...addressSettings
      })
    navigation.goBack()
  }

  console.log('EditAddressScreen renders')

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          <ColoredLabelInput value={coloredLabel} onChange={setColoredLabel} />
          <Button title="Save" onPress={handleSavePress} style={{ marginTop: 20 }} />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

const ScreenSection = styled(View)`
  padding: 22px 20px;
`

export default EditAddressScreen
