import { AddressHash, addressSettingsSaved, selectAddressByHash } from '@alephium/shared'
import { useAddressExplorerLink } from '@alephium/shared-react'
import { openBrowserAsync } from 'expo-web-browser'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import QuickActionButtons from '~/components/buttons/QuickActionButtons'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSection } from '~/components/layout/Screen'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import useForgetAddress from '~/features/addressesManagement/useForgetAddress'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { copyAddressToClipboard } from '~/utils/addresses'
import { showToast, ToastDuration } from '~/utils/layout'

interface AddressQuickActionsModalProps {
  addressHash: AddressHash
}

const AddressQuickActionsModal = memo<AddressQuickActionsModalProps>(({ addressHash }) => {
  const { dismissModal } = useModalContext()

  return (
    <BottomModal2 notScrollable noPadding title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <ScreenSection>
        <QuickActionButtons>
          <SetDefaultAddressButton addressHash={addressHash} />
          <CopyAddressHashButton addressHash={addressHash} />
          <AddressSettingsButton addressHash={addressHash} onActionCompleted={dismissModal} />
          <AddressExplorerButton addressHash={addressHash} />
          <DeleteAddressButton addressHash={addressHash} onActionCompleted={dismissModal} />
        </QuickActionButtons>
      </ScreenSection>
    </BottomModal2>
  )
})

export default AddressQuickActionsModal

interface ActionButtonProps extends AddressQuickActionsModalProps {
  onActionCompleted: () => void
}

const DeleteAddressButton = ({ addressHash, onActionCompleted }: ActionButtonProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const { t } = useTranslation()
  const forgetAddress = useForgetAddress({ addressHash, origin: 'quickActions', onConfirm: onActionCompleted })
  const canDeleteAddress = useCanDeleteAddress(addressHash)

  if (!address) return

  const handlePress = () => {
    if (!canDeleteAddress)
      Alert.alert(
        t('forgetAddress_one'),
        t('You cannot forget your default address. Set another one as default first.')
      )
    else forgetAddress()
  }

  return (
    <QuickActionButton
      title={t('Forget')}
      onPress={handlePress}
      iconProps={{ name: 'trash-outline' }}
      variant="alert"
    />
  )
}

const AddressSettingsButton = ({ addressHash, onActionCompleted }: ActionButtonProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handlePress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash } }))
    onActionCompleted()
  }

  return (
    <QuickActionButton title={t('Address settings')} onPress={handlePress} iconProps={{ name: 'settings-outline' }} />
  )
}

const CopyAddressHashButton = ({ addressHash }: Omit<ActionButtonProps, 'onActionCompleted'>) => {
  const { t } = useTranslation()

  const handlePress = () => copyAddressToClipboard(addressHash)

  return <QuickActionButton title={t('Copy address')} onPress={handlePress} iconProps={{ name: 'copy-outline' }} />
}

const SetDefaultAddressButton = ({ addressHash }: Omit<ActionButtonProps, 'onActionCompleted'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  if (!address) return

  const isDefaultAddress = address.isDefault

  const handleDefaultPress = () => {
    if (!address || address.isDefault) return

    dispatch(addressSettingsSaved({ addressHash: address.hash, settings: { isDefault: true } }))
    showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })
    sendAnalytics({ event: 'Set address as default', props: { origin: 'quickActions' } })
  }

  return isDefaultAddress ? (
    <EmptyPlaceholder noMargin>
      <AppText>{t('Default address')}</AppText>
    </EmptyPlaceholder>
  ) : (
    <QuickActionButton
      title={t('Set as default')}
      onPress={handleDefaultPress}
      iconProps={{ name: 'star' }}
      color={address?.isDefault ? address.color : undefined}
      disabled={isDefaultAddress}
    />
  )
}

const AddressExplorerButton = ({ addressHash }: Omit<ActionButtonProps, 'onActionCompleted'>) => {
  const { t } = useTranslation()
  const addressExplorerUrl = useAddressExplorerLink(addressHash)

  return (
    <QuickActionButton
      iconProps={{ name: 'open-outline' }}
      onPress={() => openBrowserAsync(addressExplorerUrl)}
      title={t('Explorer')}
    />
  )
}
