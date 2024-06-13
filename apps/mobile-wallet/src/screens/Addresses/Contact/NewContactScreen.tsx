/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
      <ContactFormBaseScreen initialValues={initialValues} onSubmit={handleSavePress} screenTitle={t('New contact')} />
      <SpinnerModal isActive={loading} text={`${t('Saving contact')}...`} />
    </>
  )
}

export default NewContactScreen
