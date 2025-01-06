import { ContactFormData } from '@alephium/shared'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import i18n from '~/features/localization/i18n'
import { isContactAddressValid, isContactNameValid } from '~/utils/form-validation'
import { validateIsAddressValid } from '~/utils/forms'

interface ContactFormProps extends ScrollScreenProps {
  initialValues: ContactFormData
  onSubmit: (data: ContactFormData) => void
  buttonText?: string
}

const requiredErrorMessage = i18n.t('This field is required')

const ContactForm = ({ initialValues, onSubmit, buttonText, headerOptions, ...props }: ContactFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormData>({ defaultValues: initialValues })
  const { t } = useTranslation()

  return (
    <ScrollScreen
      fill
      contentPaddingTop
      headerOptions={{ type: 'stack', ...headerOptions }}
      bottomButtonsRender={() => (
        <Button title={buttonText || t('Save')} variant="highlight" onPress={handleSubmit(onSubmit)} />
      )}
      {...props}
    >
      <ScreenSection fill verticalGap>
        <Controller
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Contact name')}
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
              label={t('Contact address')}
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
