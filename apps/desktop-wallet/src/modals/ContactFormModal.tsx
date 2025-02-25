import {
  Contact,
  contactDeletedFromPersistentStorage,
  ContactFormData,
  contactStoredInPersistentStorage,
  getHumanReadableError
} from '@alephium/shared'
import { isEmpty } from 'lodash'
import { UserMinus } from 'lucide-react'
import { memo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { contactDeletionFailed, contactStorageFailed } from '@/storage/addresses/addressesActions'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import {
  isAddressValid,
  isContactAddressValid,
  isContactNameValid,
  requiredErrorMessage
} from '@/utils/form-validation'

export interface ContactFormModalProps {
  contact?: Contact
}

const ContactFormModal = memo(({ id, contact }: ModalBaseProp & ContactFormModalProps) => {
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const dispatch = useAppDispatch()
  const { control, handleSubmit, formState } = useForm<ContactFormData>({
    defaultValues: contact ?? { name: '', address: '', id: undefined },
    mode: 'onChange'
  })
  const { sendAnalytics } = useAnalytics()

  if (!activeWalletId) return null

  const errors = formState.errors
  const isFormValid = isEmpty(errors)

  const onClose = () => dispatch(closeModal({ id }))

  const saveContact = (contactData: ContactFormData) => {
    try {
      const id = contactsStorage.storeOne(activeWalletId, contactData)
      dispatch(contactStoredInPersistentStorage({ ...contactData, id }))
      onClose()

      sendAnalytics({
        event: contactData.id ? 'Edited contact' : 'Saved new contact',
        props: {
          contact_name_length: contactData.name.length
        }
      })
    } catch (error) {
      dispatch(contactStorageFailed(getHumanReadableError(error, t('Could not save contact.'))))
      sendAnalytics({ type: 'error', error, message: 'Could not save contact' })
    }
  }

  const handleDeletePress = (contact: Contact) => {
    const onDeleteConfirm = () => {
      try {
        contactsStorage.deleteContact(activeWalletId, contact)
        dispatch(contactDeletedFromPersistentStorage(contact.id))
        sendAnalytics({ event: 'Deleted contact' })
      } catch (error) {
        dispatch(contactDeletionFailed(getHumanReadableError(error, t('Could not delete contact.'))))
        sendAnalytics({ type: 'error', error, message: 'Could not delete contact' })
      } finally {
        onClose()
      }
    }

    dispatch(
      openModal({
        name: 'ConfirmModal',
        props: {
          Icon: UserMinus,
          onConfirm: onDeleteConfirm,
          narrow: true,
          text: t('Are you sure you want to remove "{{ contactName }}" from your contact list?', {
            contactName: contact.name
          })
        }
      })
    )
  }

  return (
    <CenteredModal title={t(contact ? 'Edit contact' : 'New contact')} id={id} hasFooterButtons>
      <InputFieldsColumn>
        <Controller
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Name')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.name?.type === 'required' ? requiredErrorMessage : errors.name?.message}
              isValid={!!value && !errors.name}
            />
          )}
          rules={{
            required: true,
            validate: (name) => isContactNameValid({ name, id: contact?.id })
          }}
          control={control}
        />
        <Controller
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Address')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.address?.type === 'required' ? requiredErrorMessage : errors.address?.message}
              isValid={!!value && !errors.address}
            />
          )}
          rules={{
            required: true,
            validate: {
              isAddressValid,
              isContactAddressValid: (address) => isContactAddressValid({ address, id: contact?.id })
            }
          }}
          control={control}
        />
      </InputFieldsColumn>
      <ModalFooterButtons>
        {contact && (
          <ModalFooterButton role="secondary" variant="alert" onClick={() => handleDeletePress(contact)}>
            {t('Delete')}
          </ModalFooterButton>
        )}
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleSubmit(saveContact)} disabled={!isFormValid}>
          {t('Save')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default ContactFormModal
