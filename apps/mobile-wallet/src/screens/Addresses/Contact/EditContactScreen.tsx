/*
Copyright 2018 - 2022 The Alephium Authors
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

import { getHumanReadableError } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteContact, persistContact } from '~/persistent-storage/contacts'
import ContactFormBaseScreen from '~/screens/Addresses/Contact/ContactFormBaseScreen'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { ContactFormData } from '~/types/contacts'
import { showToast } from '~/utils/layout'

interface EditContactScreenProps extends StackScreenProps<RootStackParamList, 'EditContactScreen'>, ScrollScreenProps {}

const EditContactScreen = ({ navigation, route: { params }, ...props }: EditContactScreenProps) => {
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

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
            Alert.alert('Deleting contact', 'Are you sure you want to delete this contact?', [
              { text: 'Cancel' },
              {
                text: 'Delete',
                onPress: async () => {
                  setIsDeleting(true)

                  try {
                    await deleteContact(params.contactId)

                    posthog?.capture('Contact: Deleted contact')
                  } catch (e) {
                    showToast(getHumanReadableError(e, 'Could not delete contact'))

                    posthog?.capture('Error', { message: 'Could not delete contact' })
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
  }, [dispatch, navigation, params.contactId, posthog])

  if (!contact) return null

  const handleSavePress = async (formData: ContactFormData) => {
    setLoading(true)

    try {
      await persistContact(formData)

      posthog?.capture('Contact: Editted contact')
    } catch (e) {
      showToast(getHumanReadableError(e, 'Could not save contact'))

      posthog?.capture('Error', { message: 'Could not save contact' })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ContactFormBaseScreen
        headerOptions={{ headerTitle: 'Edit contact' }}
        initialValues={contact}
        onSubmit={handleSavePress}
      />
      <SpinnerModal
        isActive={loading || isDeleting}
        text={loading ? 'Saving contact...' : isDeleting ? 'Deleting contact...' : ''}
      />
    </>
  )
}

export default EditContactScreen
