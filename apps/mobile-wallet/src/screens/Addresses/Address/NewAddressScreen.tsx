import { keyring } from '@alephium/keyring'
import { StackScreenProps } from '@react-navigation/stack'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import AddressFormBaseScreen, { AddressFormData } from '~/screens/Addresses/Address/AddressFormBaseScreen'
import { newAddressGenerated, selectAllAddresses, syncLatestTransactions } from '~/store/addressesSlice'
import { getRandomLabelColor } from '~/utils/colors'
import { showExceptionToast } from '~/utils/layout'

interface NewAddressScreenProps extends StackScreenProps<RootStackParamList, 'NewAddressScreen'>, ScrollScreenProps {}

const NewAddressScreen = ({ navigation, ...props }: NewAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const persistAddressSettings = usePersistAddressSettings()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isDefault: false
  }

  const handleGeneratePress = async ({ isDefault, label, color, group }: AddressFormData) => {
    setLoading(true)

    try {
      await initializeKeyringWithStoredWallet()
      const newAddress = {
        ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes.current }),
        settings: { label, color, isDefault }
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

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <AddressFormBaseScreen
        screenTitle={t('New address')}
        initialValues={initialValues}
        onSubmit={handleGeneratePress}
        allowGroupSelection
        contentPaddingTop
      />
      <SpinnerModal isActive={loading} text={`${t('Generating new address')}...`} />
    </>
  )
}

export default NewAddressScreen
