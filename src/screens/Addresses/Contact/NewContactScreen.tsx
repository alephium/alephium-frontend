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
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistContact } from '~/persistent-storage/contacts'
import ContactForm from '~/screens/Addresses/Contact/ContactForm'
import { ContactFormData } from '~/types/contacts'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewContactScreen'>

const NewContactScreen = ({ navigation }: ScreenProps) => {
  const [loading, setLoading] = useState(false)

  const initialValues = {
    id: undefined,
    name: '',
    address: ''
  }

  const handleSavePress = async (formData: ContactFormData) => {
    setLoading(true)

    try {
      await persistContact(formData)
    } catch (e) {
      Toast.show(getHumanReadableError(e, 'Could not save contact.'))
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ContactForm initialValues={initialValues} onSubmit={handleSavePress} />
      <SpinnerModal isActive={loading} text="Saving contact..." />
    </>
  )
}

export default NewContactScreen
