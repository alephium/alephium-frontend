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
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import BoxSurface from '~/components/layout/BoxSurface'
import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

export interface SwitchNetworkModalProps {
  onCustomNetworkPress: () => void
}

const SwitchNetworkModal = withModal<SwitchNetworkModalProps>(({ id, onCustomNetworkPress }) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkNames.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkNames.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkNames.custom) {
      onCustomNetworkPress()
    } else {
      await persistSettings('network', networkSettingsPresets[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }

    dispatch(closeModal({ id }))
  }

  const networkNames = Object.values(NetworkNames)

  return (
    <BottomModal modalId={id} title={t('Current network')} contentVerticalGap>
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
    </BottomModal>
  )
})

export default SwitchNetworkModal
