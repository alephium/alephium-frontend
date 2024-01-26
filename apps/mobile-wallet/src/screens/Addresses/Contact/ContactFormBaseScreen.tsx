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

import { Controller, useForm } from 'react-hook-form'

import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { ContactFormData } from '~/types/contacts'
import { isContactAddressValid, isContactNameValid } from '~/utils/form-validation'
import { validateIsAddressValid } from '~/utils/forms'

interface ContactFormProps extends ScrollScreenProps {
  initialValues: ContactFormData
  onSubmit: (data: ContactFormData) => void
  buttonText?: string
}

const requiredErrorMessage = 'This field is required'

const ContactForm = ({ initialValues, onSubmit, buttonText = 'Save', headerOptions, ...props }: ContactFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormData>({ defaultValues: initialValues })

  return (
    <ScrollScreen
      usesKeyboard
      fill
      headerOptions={{
        type: 'stack',
        headerRight: () => <ContinueButton title={buttonText} onPress={handleSubmit(onSubmit)} iconProps={undefined} />,
        ...headerOptions
      }}
      {...props}
    >
      <ScreenSection fill verticalGap>
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
      </ScreenSection>
    </ScrollScreen>
  )
}

export default ContactForm
