import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import Row from '~/components/Row'
import SpinnerModal from '~/components/SpinnerModal'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { deleteAddress } from '~/persistent-storage/wallet'
import AddressForm, { AddressFormData } from '~/screens/Addresses/Address/AddressForm'
import { addressDeleted } from '~/store/addresses/addressesActions'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { copyAddressToClipboard } from '~/utils/addresses'
import { showExceptionToast, showToast } from '~/utils/layout'

interface AddressSettingsModalProps {
  addressHash: AddressHash
}

const AddressSettingsModal = withModal<AddressSettingsModalProps>(({ id, addressHash }) => {
  const dispatch = useAppDispatch()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()
  const canDeleteAddress = useCanDeleteAddress(addressHash)

  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState<AddressFormData | undefined>(address?.settings)

  useEffect(() => {
    if (!address) {
      dispatch(closeModal({ id }))
    }
  }, [address, dispatch, id])

  const handleForgetPress = async () => {
    if (!canDeleteAddress) return null

    Alert.alert(t('forgetAddress_one'), t('You can always re-add it to your wallet.'), [
      {
        text: t('Cancel'),
        style: 'cancel'
      },
      {
        text: t('Forget'),
        style: 'destructive',
        onPress: async () => {
          dispatch(closeModal({ name: 'AddressDetailsModal' }))
          dispatch(closeModal({ id }))

          try {
            await deleteAddress(addressHash)
            dispatch(addressDeleted(addressHash))
            showToast({
              type: 'info',
              text1: t('Address forgotten')
            })
          } catch (error) {
            const message = t('Could not forget address')
            sendAnalytics({ type: 'error', message, error })
            showToast({
              type: 'error',
              text1: t('Could not forget address'),
              text2: getHumanReadableError(error, '')
            })
          }

          sendAnalytics({ event: 'Deleted address', props: { origin: 'Address card' } })
        }
      }
    ])
  }

  const handleSavePress = async () => {
    if (!settings || !address) return

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
    <BottomModal modalId={id} title={t('Address settings')} noPadding>
      <ScreenSection>
        <Row title={t('Address hash')}>
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
            <Button
              title={t('Forget')}
              iconProps={{ name: 'trash-2' }}
              short
              variant="alert"
              onPress={handleForgetPress}
            />
          </Row>
        </ScreenSection>
      )}
      <ScreenSection>
        <BottomButtons fullWidth backgroundColor="back1" bottomInset>
          <Button title={t('Save')} variant="highlight" onPress={handleSavePress} />
        </BottomButtons>
      </ScreenSection>
      <SpinnerModal isActive={loading} text={`${t('Saving')}...`} />
    </BottomModal>
  )
})

export default AddressSettingsModal

const HashEllipsed = styled(AppText)`
  min-width: 100px;
  max-width: 50%;
  margin-top: 8px;
`
