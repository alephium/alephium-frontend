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

import { capitalize } from 'lodash'
import { useState } from 'react'
import { View } from 'react-native'

import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { networkPresetSettings, persistSettings } from '~/persistent-storage/settings'
import { networkPresetSwitched } from '~/store/networkSlice'
import { NetworkName, NetworkPreset } from '~/types/network'

const networkNames = Object.values(NetworkName)

interface SwitchNetworkModalProps extends ModalContentProps {
  onCustomNetworkPress: () => void
}

const SwitchNetworkModal = ({ onClose, onCustomNetworkPress, ...props }: SwitchNetworkModalProps) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)

  const dispatch = useAppDispatch()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkName.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkName.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkName.custom) {
      onClose && onClose()
      onCustomNetworkPress()
    } else {
      await persistSettings('network', networkPresetSettings[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Current network</BottomModalScreenTitle>
      </ScreenSection>
      <View>
        <BoxSurface>
          {networkNames.map((networkName) => (
            <RadioButtonRow
              key={networkName}
              title={capitalize(networkName)}
              onPress={() => handleNetworkItemPress(networkName)}
              isActive={networkName === selectedNetworkName}
            />
          ))}
        </BoxSurface>
      </View>
    </ModalContent>
  )
}

export default SwitchNetworkModal
