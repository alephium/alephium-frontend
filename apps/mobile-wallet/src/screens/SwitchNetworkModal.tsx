import { NetworkNames, NetworkPreset, networkPresetSwitched, networkSettingsPresets } from '@alephium/shared'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import Surface from '~/components/layout/Surface'
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
        <Surface>
          {networkNames.map((networkName, index) => (
            <RadioButtonRow
              key={networkName}
              title={capitalize(networkName)}
              onPress={() => handleNetworkItemPress(networkName)}
              isActive={networkName === selectedNetworkName}
              isLast={index === networkNames.length - 1}
            />
          ))}
        </Surface>
      </View>
    </BottomModal>
  )
})

export default SwitchNetworkModal
