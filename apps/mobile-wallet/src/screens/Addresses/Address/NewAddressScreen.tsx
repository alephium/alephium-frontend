import { keyring } from '@alephium/keyring'
import { StackScreenProps } from '@react-navigation/stack'
import { useRef, useState } from 'react'
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
import { syncLatestTransactions } from '~/store/addresses/addressesActions'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { newAddressGenerated } from '~/store/addressesSlice'
import { getRandomLabelColor } from '~/utils/colors'
import { showExceptionToast } from '~/utils/layout'

interface NewAddressScreenProps extends StackScreenProps<RootStackParamList, 'NewAddressScreen'>, ScrollScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
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
      const newAddress = {
        ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes.current }),
        label,
        color,
        isDefault
      }

      await persistAddressSettings(newAddress)
      dispatch(newAddressGenerated(newAddress))
      await dispatch(syncLatestTransactions({ addresses: newAddress.hash, areAddressesNew: true }))

      sendAnalytics({
        event: 'Address: Generated new address',
        props: {
          note: group === undefined ? 'In random group' : 'In specific group'
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
