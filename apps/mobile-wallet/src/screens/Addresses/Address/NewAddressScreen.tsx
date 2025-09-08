import { keyring } from '@alephium/keyring'
import { GROUPLESS_ADDRESS_KEY_TYPE, newAddressesSaved, selectAllAddressIndexes } from '@alephium/shared'
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
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import AddressForm, { AddressFormData } from '~/screens/Addresses/Address/AddressForm'
import { getRandomLabelColor } from '~/utils/colors'
import { showExceptionToast } from '~/utils/layout'

interface NewAddressScreenProps extends StackScreenProps<RootStackParamList, 'NewAddressScreen'>, ScrollScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const { indexesOfGrouplessAddresses, indexesOfAddressesWithGroup } = useAppSelector(selectAllAddressIndexes)
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isDefault: false
  }

  const [values, setValues] = useState<AddressFormData>(initialValues)

  const handleGeneratePress = async () => {
    const { isDefault, label, color, group } = values

    dispatch(activateAppLoading(t('Generating new address')))

    try {
      await initializeKeyringWithStoredWallet()

      const newAddress =
        group === undefined
          ? {
              ...keyring.generateAndCacheAddress({
                skipAddressIndexes: indexesOfGrouplessAddresses,
                keyType: GROUPLESS_ADDRESS_KEY_TYPE
              }),
              label,
              color,
              isDefault,
              isNew: true
            }
          : {
              ...keyring.generateAndCacheAddress({
                group,
                skipAddressIndexes: indexesOfAddressesWithGroup,
                keyType: 'default'
              }),
              label,
              color,
              isDefault,
              isNew: true
            }

      await persistAddressSettings(newAddress)
      dispatch(newAddressesSaved([newAddress]))

      sendAnalytics({
        event: 'Address: Generated new address',
        props: {
          note: group === undefined ? 'groupless' : 'In specific group'
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
