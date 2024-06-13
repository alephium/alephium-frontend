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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
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

  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
                  setIsDeleting(true)

                  try {
                    await deleteContact(params.contactId)

                    sendAnalytics({ event: 'Contact: Deleted contact' })
                  } catch (error) {
                    const message = 'Could not delete contact'

                    showExceptionToast(error, t(message))
                    sendAnalytics({ type: 'error', error, message })
                  } finally {
                    setIsDeleting(false)
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
    setLoading(true)

    try {
      await persistContact(formData)

      sendAnalytics({ event: 'Contact: Editted contact' })
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
        headerOptions={{ headerTitle: t('Edit contact') }}
        initialValues={contact}
        onSubmit={handleSavePress}
      />
      <SpinnerModal
        isActive={loading || isDeleting}
        text={loading ? `${t('Saving')}...` : isDeleting ? `${t('Deleting')}...` : ''}
      />
    </>
  )
}

export default EditContactScreen
