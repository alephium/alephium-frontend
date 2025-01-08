import { AddressSettings } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import AddressDeleteButton from '~/features/addressesManagement/AddressDeleteButton'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import AddressFormBaseScreen from '~/screens/Addresses/Address/AddressFormBaseScreen'
import { addressSettingsSaved, selectAddressByHash } from '~/store/addressesSlice'
import { showExceptionToast } from '~/utils/layout'

interface EditAddressScreenProps extends StackScreenProps<RootStackParamList, 'EditAddressScreen'>, ScrollScreenProps {}

const EditAddressScreen = ({ navigation, route: { params } }: EditAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const addressHash = params.addressHash
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
    navigation.goBack()
  }

  return (
    <>
      <AddressFormBaseScreen
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
    </>
  )
}

export default EditAddressScreen

const HashEllipsed = styled(AppText)`
  max-width: 50%;
  margin-top: 8px;
`
