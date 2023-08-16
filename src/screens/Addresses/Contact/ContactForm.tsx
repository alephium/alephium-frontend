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

import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import { BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import { AddressHash } from '~/types/addresses'
import { ContactFormData } from '~/types/contacts'
import { isContactAddressValid, isContactNameValid } from '~/utils/form-validation'
import { validateIsAddressValid } from '~/utils/forms'

interface ContactFormProps {
  initialValues: ContactFormData
  onSubmit: (data: ContactFormData) => void
  buttonText?: string
  disableIsMainToggle?: boolean
  addressHash?: AddressHash
}

const requiredErrorMessage = 'This field is required'

const ContactForm = ({ initialValues, onSubmit, buttonText = 'Save' }: ContactFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormData>({ defaultValues: initialValues })

  return (
    <>
      <View style={{ flexGrow: 1 }}>
        <ScreenSection>
          <BoxSurface>
            <Controller
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contact name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.type === 'required' ? requiredErrorMessage : errors.name?.message}
                />
              )}
              rules={{
                required: true,
                validate: (name) => isContactNameValid({ name, id: initialValues?.id })
              }}
              control={control}
            />
            <Controller
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Contact address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.address?.type === 'required' ? requiredErrorMessage : errors.address?.message}
                />
              )}
              rules={{
                required: true,
                validate: {
                  isAddressValid: validateIsAddressValid,
                  isContactAddressValid: (address) => isContactAddressValid({ address, id: initialValues?.id })
                }
              }}
              control={control}
            />
          </BoxSurface>
        </ScreenSection>
      </View>
      <BottomScreenSection>
        <Button title={buttonText} centered onPress={handleSubmit(onSubmit)} />
      </BottomScreenSection>
    </>
  )
}

export default ContactForm
