import { AddressHash, AddressSettings } from '@alephium/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import AddressDeleteButton from '~/features/addressesManagement/AddressDeleteButton'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import AddressForm from '~/screens/Addresses/Address/AddressForm'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { showExceptionToast } from '~/utils/layout'

interface AddressSettingsModalProps {
  addressHash: AddressHash
}

const AddressSettingsModal = withModal<AddressSettingsModalProps>(({ id, addressHash }) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  if (!address) return null

  const handleSavePress = async (settings: AddressSettings) => {
    if (address.settings.isDefault && !settings.isDefault) return

    setLoading(true)

    try {
      await persistAddressSettings({ ...address, settings })
      dispatch(addressSettingsSaved({ ...address, settings }))

      sendAnalytics({ event: 'Address: Edited address settings' })
    } catch (error) {
      const message = 'Could not edit address settings'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }

    setLoading(false)
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Address settings')}>
      <AddressForm
        contentPaddingTop
        initialValues={address.settings}
        onSubmit={handleSavePress}
        buttonText="Save"
        disableIsMainToggle={address.settings.isDefault}
        screenTitle={t('Address settings')}
        headerOptions={{
          headerRight: () => <AddressDeleteButton addressHash={addressHash} color={theme.global.warning} />
        }}
        HeaderComponent={
          <ScreenSection>
            <HashEllipsed numberOfLines={1} ellipsizeMode="middle" color="secondary">
              {addressHash}
            </HashEllipsed>
          </ScreenSection>
        }
      />
      <SpinnerModal isActive={loading} text={`${t('Saving')}...`} />
    </BottomModal>
  )
})

export default AddressSettingsModal

const HashEllipsed = styled(AppText)`
  max-width: 50%;
  margin-top: 8px;
`
