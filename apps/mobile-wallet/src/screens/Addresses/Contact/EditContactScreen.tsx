import { ContactFormData } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteContact, persistContact } from '~/persistent-storage/contacts'
import ContactFormBaseScreen from '~/screens/Addresses/Contact/ContactFormBaseScreen'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { showExceptionToast } from '~/utils/layout'

interface EditContactScreenProps extends StackScreenProps<RootStackParamList, 'EditContactScreen'>, ScrollScreenProps {}

const EditContactScreen = ({ navigation, route: { params } }: EditContactScreenProps) => {
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Delete"
          type="transparent"
          variant="alert"
          onPress={() => {
            Alert.alert(t('Deleting'), t('Are you sure you want to delete this contact?'), [
              { text: t('Cancel') },
              {
                text: t('Delete'),
                onPress: async () => {
                  try {
                    await deleteContact(params.contactId)

                    sendAnalytics({ event: 'Contact: Deleted contact' })
                  } catch (error) {
                    const message = 'Could not delete contact'

                    showExceptionToast(error, t(message))
                    sendAnalytics({ type: 'error', error, message })
                  }

                  navigation.pop(3)
                }
              }
            ])
          }}
        />
      )
    })
  }, [dispatch, navigation, params.contactId, t])

  if (!contact) return null

  const handleSavePress = async (formData: ContactFormData) => {
    try {
      await persistContact(formData)

      sendAnalytics({ event: 'Contact: Editted contact' })
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
    />
  )
}

export default EditContactScreen
