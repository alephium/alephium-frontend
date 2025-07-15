import { NetworkNames, NetworkPreset, networkPresetSwitched, networkSettingsPresets } from '@alephium/shared'
import { capitalize } from 'lodash'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

export interface SwitchNetworkModalProps {
  onCustomNetworkPress: () => void
}

const SwitchNetworkModal = memo<SwitchNetworkModalProps>(({ onCustomNetworkPress }) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkNames.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkNames.custom) => {
    dispatch(activateAppLoading({ text: t('Switching networks'), bg: 'full', blur: false, minDurationMs: 3000 }))

    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkNames.custom) {
      onCustomNetworkPress()
    } else {
      await persistSettings('network', networkSettingsPresets[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }

    dismissModal()
    dispatch(deactivateAppLoading())
  }

  const networkNames = Object.values(NetworkNames)

  return (
    <BottomModal2 notScrollable title={t('Current network')}>
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
    </BottomModal2>
  )
})

export default SwitchNetworkModal
