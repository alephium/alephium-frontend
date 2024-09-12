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

import { NetworkNames, NetworkPreset, networkPresetSwitched, networkSettingsPresets } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import BoxSurface from '~/components/layout/BoxSurface'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { ModalContent } from '~/features/modals/ModalContent'
import withModalWrapper from '~/features/modals/withModalWrapper'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import BottomModal from '~/modals/BottomModal'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistSettings } from '~/persistent-storage/settings'

export interface SwitchNetworkModalProps {
  onCustomNetworkPress: () => void
}

const SwitchNetworkModal = withModalWrapper<SwitchNetworkModalProps>(({ id, onCustomNetworkPress, ...props }) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkNames.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkNames.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkNames.custom) {
      navigation.navigate('CustomNetworkScreen')
    } else {
      await persistSettings('network', networkSettingsPresets[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }
  }

  const networkNames = Object.values(NetworkNames)

  return (
    <BottomModal
      id={id}
      Content={(props) => (
        <ModalContent verticalGap {...props}>
          <ScreenSection>
            <ModalScreenTitle>{t('Current network')}</ModalScreenTitle>
          </ScreenSection>
          <View>
            <BoxSurface>
              {networkNames.map((networkName, index) => (
                <RadioButtonRow
                  key={networkName}
                  title={capitalize(networkName)}
                  onPress={() => handleNetworkItemPress(networkName)}
                  isActive={networkName === selectedNetworkName}
                  isLast={index === networkNames.length - 1}
                />
              ))}
            </BoxSurface>
          </View>
        </ModalContent>
      )}
    />
  )
})

export default SwitchNetworkModal
