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
import { useState } from 'react'
import Toast from 'react-native-root-toast'

import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistContact } from '~/persistent-storage/wallets'
import ContactForm from '~/screens/Addresses/Contact/ContactForm'
import { contactStoredInPersistentStorage } from '~/store/addresses/addressesActions'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { Contact, ContactFormData } from '~/types/contacts'

type ScreenProps = StackScreenProps<RootStackParamList, 'EditContactScreen'>

const EditContactScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(false)

  if (!contact) return null

  const handleSavePress = async (formData: ContactFormData) => {
    setLoading(true)

    try {
      await persistContact(formData)

      dispatch(contactStoredInPersistentStorage(formData as Contact))
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Could not save contact.'))
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ContactForm initialValues={contact} onSubmit={handleSavePress} />
      <SpinnerModal isActive={loading} text="Saving contact..." />
    </>
  )
}

export default EditContactScreen
