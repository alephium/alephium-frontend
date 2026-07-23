import { keyring } from '@alephium/keyring'
import { AnalyticsEvent, GROUPLESS_ADDRESS_KEY_TYPE, SCHNORR_ADDRESS_KEY_TYPE } from '@alephium/shared'
import { newAddressesSaved, selectAllAddressIndexes } from '@alephium/shared/store'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/walletMnemonic'
import AddressForm, { AddressFormData } from '~/screens/Addresses/Address/AddressForm'
import { getRandomLabelColor } from '~/utils/colors'
import { showExceptionToast } from '~/utils/layout'

interface NewAddressScreenProps extends StackScreenProps<RootStackParamList, 'NewAddressScreen'>, ScrollScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const walletId = useAppSelector((s) => s.wallet.id)
  const { indexesOfGrouplessAddresses, indexesOfDefaultAddresses, indexesOfSchnorrAddresses } =
    useAppSelector(selectAllAddressIndexes)
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isDefault: false
  }

  const [values, setValues] = useState<AddressFormData>(initialValues)

  const handleGeneratePress = async () => {
    const { isDefault, label, color, group, addressType = 'groupless' } = values

    dispatch(activateAppLoading(t('Generating new address')))

    try {
      await initializeKeyringWithStoredWallet(walletId)

      const generatedAddress =
        addressType === 'schnorr'
          ? keyring.generateAndCacheAddress({
              group,
              skipAddressIndexes: indexesOfSchnorrAddresses,
              keyType: SCHNORR_ADDRESS_KEY_TYPE
            })
          : addressType === 'grouped'
            ? keyring.generateAndCacheAddress({
                group,
                skipAddressIndexes: indexesOfDefaultAddresses,
                keyType: 'default'
              })
            : keyring.generateAndCacheAddress({
                skipAddressIndexes: indexesOfGrouplessAddresses,
                keyType: GROUPLESS_ADDRESS_KEY_TYPE
              })

      const newAddress = { ...generatedAddress, label, color, isDefault }

      await persistAddressSettings(newAddress)
      dispatch(newAddressesSaved([{ ...newAddress, isNew: true }]))

      sendAnalytics({
        event: AnalyticsEvent.ADDRESS_CREATED,
        props: {
          address_type: addressType
        }
      })
    } catch (error) {
      const message = 'Could not save new address'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    } finally {
      keyring.clear()
    }

    dispatch(deactivateAppLoading())

    navigation.goBack()
  }

  return (
    <ScrollScreen
      fill
      hasKeyboard
      headerTitleAlwaysVisible
      headerOptions={{ headerTitle: t('New address'), type: 'stack' }}
      contentPaddingTop
      bottomButtonsRender={() => <Button title={t('Generate')} variant="highlight" onPress={handleGeneratePress} />}
      {...props}
    >
      <ScreenSection>
        <AddressForm
          screenTitle={t('New address')}
          initialValues={initialValues}
          onValuesChange={setValues}
          allowGroupSelection
        />
      </ScreenSection>
    </ScrollScreen>
  )
}

export default NewAddressScreen
