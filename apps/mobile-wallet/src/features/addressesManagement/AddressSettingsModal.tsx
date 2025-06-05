import { AddressHash, addressSettingsSaved, selectAddressByHash } from '@alephium/shared'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import useForgetAddress from '~/features/addressesManagement/useForgetAddress'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import AddressForm, { AddressFormData } from '~/screens/Addresses/Address/AddressForm'
import { showExceptionToast } from '~/utils/layout'

interface AddressSettingsModalProps {
  addressHash: AddressHash
  onForgetAddress?: () => void
}

const AddressSettingsModal = memo<AddressSettingsModalProps & ModalBaseProp>(({ id, addressHash, onForgetAddress }) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()
  const canDeleteAddress = useCanDeleteAddress(addressHash)
  const { dismissModal, onDismiss } = useModalDismiss({ id })

  const forgetAddress = useForgetAddress({
    addressHash,
    origin: 'addressSettings',
    onConfirm: () => {
      onForgetAddress?.()
      dismissModal()
    }
  })

  const initialSettings = address
    ? {
        isDefault: address.isDefault,
        color: address.color,
        label: address.label
      }
    : undefined

  const [settings, setSettings] = useState<AddressFormData | undefined>(initialSettings)

  const handleSavePress = async () => {
    if (!settings || !address) return

    if (address.isDefault && !settings.isDefault) return

    try {
      await persistAddressSettings({ ...address, ...settings })
      dispatch(addressSettingsSaved({ addressHash: address.hash, settings }))

      sendAnalytics({ event: 'Address: Edited address settings' })
    } catch (error) {
      const message = 'Could not edit address settings'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }

    dismissModal()
  }

  return (
    <BottomModal2 onDismiss={onDismiss} notScrollable modalId={id} title={t('Address settings')}>
      <AddressForm
        initialValues={initialSettings}
        onValuesChange={setSettings}
        buttonText="Save"
        disableIsMainToggle={address?.isDefault}
        screenTitle={t('Address settings')}
        isInModal
      />
      {canDeleteAddress && (
        <Row title={t('Forget address')} subtitle={t('You can always re-add it to your wallet.')} isLast>
          <Button title={t('Forget')} iconProps={{ name: 'trash-2' }} short variant="alert" onPress={forgetAddress} />
        </Row>
      )}

      <BottomButtons fullWidth backgroundColor="back1">
        <Button title={t('Save')} variant="highlight" onPress={handleSavePress} />
      </BottomButtons>
    </BottomModal2>
  )
})

export default AddressSettingsModal
