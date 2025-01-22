import { ContactFormData } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistContact } from '~/persistent-storage/contacts'
import ContactFormBaseScreen from '~/screens/Addresses/Contact/ContactFormBaseScreen'
import { showExceptionToast } from '~/utils/layout'

interface NewContactScreenProps extends StackScreenProps<RootStackParamList, 'NewContactScreen'>, ScrollScreenProps {}

const NewContactScreen = ({ navigation, route: { params } }: NewContactScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const initialValues = {
    id: undefined,
    name: '',
    address: params?.addressHash ?? ''
  }

  const handleSavePress = async (formData: ContactFormData) => {
    dispatch(activateAppLoading(t('Saving')))

    try {
      await persistContact(formData)

      sendAnalytics({ event: 'Contact: Created new contact' })
    } catch (error) {
      const message = 'Could not save contact'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', error, message })
    }

    dispatch(deactivateAppLoading())

    navigation.goBack()
  }

  return (
    <ContactFormBaseScreen
      initialValues={initialValues}
      onSubmit={handleSavePress}
      screenTitle={t('New contact')}
      contentPaddingTop
    />
  )
}

export default NewContactScreen
