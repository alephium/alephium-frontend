import { AnalyticsEvent } from '@alephium/shared'
import { ContactFormData } from '@alephium/shared/types'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteContact, persistContact } from '~/persistent-storage/contacts'
import ContactFormBaseScreen from '~/screens/Addresses/Contact/ContactFormBaseScreen'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { showExceptionToast } from '~/utils/layout'

interface EditContactScreenProps extends StackScreenProps<RootStackParamList, 'EditContactScreen'>, ScrollScreenProps {}

const EditContactScreen = ({ navigation, route: { params } }: EditContactScreenProps) => {
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const walletId = useAppSelector((s) => s.wallet.id)
  const { t } = useTranslation()

  const handleDeletePress = () => {
    Alert.alert(t('Deleting'), t('Are you sure you want to delete this contact?'), [
      { text: t('Cancel') },
      {
        text: t('Delete'),
        onPress: async () => {
          try {
            await deleteContact(walletId, params.contactId)

            sendAnalytics({ event: AnalyticsEvent.CONTACT_DELETED })
          } catch (error) {
            const message = 'Could not delete contact'

            showExceptionToast(error, t(message))
            sendAnalytics({ type: 'error', error, message })
          }

          // [tabs] -> ContactScreen -> EditContactScreen: pop both, or ContactScreen is left showing a
          // contact that no longer exists.
          navigation.pop(2)
        }
      }
    ])
  }

  if (!contact) return null

  const handleSavePress = async (formData: ContactFormData) => {
    try {
      await persistContact(walletId, formData)

      sendAnalytics({ event: AnalyticsEvent.CONTACT_EDITED })
    } catch (error) {
      const message = 'Could not save contact'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', error, message })
    }

    navigation.pop()
  }

  return (
    <ContactFormBaseScreen
      headerOptions={{ headerTitle: t('Edit contact') }}
      initialValues={contact}
      onSubmit={handleSavePress}
      onDelete={handleDeletePress}
    />
  )
}

export default EditContactScreen
