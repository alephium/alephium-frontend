import { AddressHash } from '@alephium/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import Row from '~/components/Row'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import useForgetAddress from '~/features/addressesManagement/useForgetAddress'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import AddressForm, { AddressFormData } from '~/screens/Addresses/Address/AddressForm'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { copyAddressToClipboard } from '~/utils/addresses'
import { showExceptionToast } from '~/utils/layout'

interface AddressSettingsModalProps {
  addressHash: AddressHash
  parentModalId?: number
}

const AddressSettingsModal = withModal<AddressSettingsModalProps>(({ id, addressHash, parentModalId }) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()
  const canDeleteAddress = useCanDeleteAddress(addressHash)

  const forgetAddress = useForgetAddress({
    addressHash,
    origin: 'addressSettings',
    onConfirm: () => {
      if (parentModalId) dispatch(closeModal({ id: parentModalId }))
      dispatch(closeModal({ id }))
    }
  })

  const [settings, setSettings] = useState<AddressFormData | undefined>(address?.settings)

  const handleSavePress = async () => {
    if (!settings || !address) return

    if (address.settings.isDefault && !settings.isDefault) return

    dispatch(activateAppLoading(t('Saving')))

    try {
      await persistAddressSettings({ ...address, settings })
      dispatch(addressSettingsSaved({ ...address, settings }))

      sendAnalytics({ event: 'Address: Edited address settings' })
    } catch (error) {
      const message = 'Could not edit address settings'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }

    dispatch(deactivateAppLoading())
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Address settings')} noPadding>
      <ScreenSection>
        <Row title={t('Address')}>
          <HashEllipsed
            numberOfLines={1}
            ellipsizeMode="middle"
            color="secondary"
            onLongPress={() => copyAddressToClipboard(addressHash)}
          >
            {addressHash}
          </HashEllipsed>
        </Row>
      </ScreenSection>
      <AddressForm
        initialValues={address?.settings}
        onValuesChange={setSettings}
        buttonText="Save"
        disableIsMainToggle={address?.settings.isDefault}
        screenTitle={t('Address settings')}
      />
      {canDeleteAddress && (
        <ScreenSection>
          <Row title={t('Forget address')} subtitle={t('You can always re-add it to your wallet.')} isLast>
            <Button title={t('Forget')} iconProps={{ name: 'trash-2' }} short variant="alert" onPress={forgetAddress} />
          </Row>
        </ScreenSection>
      )}
      <ScreenSection>
        <BottomButtons fullWidth backgroundColor="back1" bottomInset>
          <Button title={t('Save')} variant="highlight" onPress={handleSavePress} />
        </BottomButtons>
      </ScreenSection>
    </BottomModal>
  )
})

export default AddressSettingsModal

const HashEllipsed = styled(AppText)`
  min-width: 100px;
  max-width: 50%;
  margin-top: 8px;
`
