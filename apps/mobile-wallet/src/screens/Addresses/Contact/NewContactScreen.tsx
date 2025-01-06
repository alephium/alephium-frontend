import { ContactFormData } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistContact } from '~/persistent-storage/contacts'
import ContactFormBaseScreen from '~/screens/Addresses/Contact/ContactFormBaseScreen'
import { showExceptionToast } from '~/utils/layout'

interface NewContactScreenProps extends StackScreenProps<RootStackParamList, 'NewContactScreen'>, ScrollScreenProps {}

const NewContactScreen = ({ navigation }: NewContactScreenProps) => {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const initialValues = {
    id: undefined,
    name: '',
    address: ''
  }

  const handleSavePress = async (formData: ContactFormData) => {
    setLoading(true)

    try {
      await persistContact(formData)

      sendAnalytics({ event: 'Contact: Created new contact' })
    } catch (error) {
      const message = 'Could not save contact'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', error, message })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ContactFormBaseScreen
        initialValues={initialValues}
        onSubmit={handleSavePress}
        screenTitle={t('New contact')}
        contentPaddingTop
      />
      <SpinnerModal isActive={loading} text={`${t('Saving')}...`} />
    </>
  )
}

export default NewContactScreen
