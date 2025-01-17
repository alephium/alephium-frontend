import { AddressHash } from '@alephium/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { ScreenSection } from '~/components/layout/Screen'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import useForgetAddress from '~/features/addressesManagement/useForgetAddress'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'
import { addressSettingsSaved } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

interface AddressQuickActionsModalProps {
  addressHash: AddressHash
}

const AddressQuickActionsModal = withModal<AddressQuickActionsModalProps>(({ id, addressHash }) => {
  const dispatch = useAppDispatch()

  const handleClose = () => dispatch(closeModal({ id }))

  return (
    <BottomModal modalId={id} noPadding title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <ScreenSection>
        <ActionButtons>
          <DeleteAddressButton addressHash={addressHash} onPress={handleClose} />
          <SetDefaultAddressButton addressHash={addressHash} onPress={handleClose} />
        </ActionButtons>
      </ScreenSection>
    </BottomModal>
  )
})

export default AddressQuickActionsModal

interface ActionButtonProps extends AddressQuickActionsModalProps {
  onPress: () => void
}

const DeleteAddressButton = ({ addressHash, onPress }: ActionButtonProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const { t } = useTranslation()
  const forgetAddress = useForgetAddress({ addressHash, origin: 'quickActions', onConfirm: onPress })
  const canDeleteAddress = useCanDeleteAddress(addressHash)

  if (!address) return

  const handlePress = () => {
    if (!canDeleteAddress) Alert.alert(t('You cannot forget your default address. Set another one as default first.'))
    else forgetAddress()
  }

  return <QuickActionButton title={t('Forget')} onPress={handlePress} iconProps={{ name: 'trash-2' }} variant="alert" />
}

const SetDefaultAddressButton = ({ addressHash }: ActionButtonProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const persistAddressSettings = usePersistAddressSettings()

  const [defaultAddressIsChanging, setDefaultAddressIsChanging] = useState(false)

  if (!address) return

  const isDefaultAddress = address.settings.isDefault

  const handleDefaultPress = async () => {
    if (!address || address.settings.isDefault) return

    setDefaultAddressIsChanging(true)

    try {
      const newSettings = { ...address.settings, isDefault: true }

      await persistAddressSettings({ ...address, settings: newSettings })
      dispatch(addressSettingsSaved({ ...address, settings: newSettings }))

      showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })

      sendAnalytics({ event: 'Set address as default', props: { origin: 'quickActions' } })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not use address card default toggle' })
    } finally {
      setDefaultAddressIsChanging(false)
    }
  }

  return (
    <QuickActionButton
      title={t(isDefaultAddress ? 'Default address' : 'Set as default')}
      onPress={handleDefaultPress}
      iconProps={{ name: 'star' }}
      loading={defaultAddressIsChanging}
      color={address?.settings.isDefault ? address.settings.color : undefined}
      disabled={isDefaultAddress}
    />
  )
}

// TODO: DRY
const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP / 2}px 0;
  gap: 10px;
`
