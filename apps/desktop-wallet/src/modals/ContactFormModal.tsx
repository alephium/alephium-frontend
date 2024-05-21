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

import {
  Contact,
  contactDeletedFromPersistentStorage,
  ContactFormData,
  contactStoredInPersistentStorage,
  getHumanReadableError
} from '@alephium/shared'
import { isEmpty } from 'lodash'
import { UserMinus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import ConfirmModal from '@/modals/ConfirmModal'
import ModalPortal from '@/modals/ModalPortal'
import { contactDeletionFailed, contactStorageFailed } from '@/storage/addresses/addressesActions'
import { contactsStorage } from '@/storage/addresses/contactsPersistentStorage'
import {
  isAddressValid,
  isContactAddressValid,
  isContactNameValid,
  requiredErrorMessage
} from '@/utils/form-validation'

interface ContactFormModalProps {
  contact?: Contact
  onClose: () => void
}

const ContactFormModal = ({ contact, onClose }: ContactFormModalProps) => {
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const dispatch = useAppDispatch()
  const { control, handleSubmit, formState } = useForm<ContactFormData>({
    defaultValues: contact ?? { name: '', address: '', id: undefined },
    mode: 'onChange'
  })
  const { sendAnalytics } = useAnalytics()

  const [isDeleteContactModalOpen, setIsDeleteContactModalOpen] = useState(false)

  if (!activeWalletId) return null

  const errors = formState.errors
  const isFormValid = isEmpty(errors)

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

  const deleteContact = () => {
    if (!contact) return

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

  return (
    <>
      <CenteredModal title={t(contact ? 'Edit contact' : 'New contact')} onClose={onClose}>
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
            <ModalFooterButton role="secondary" variant="alert" onClick={() => setIsDeleteContactModalOpen(true)}>
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
      <ModalPortal>
        {contact && isDeleteContactModalOpen && (
          <ConfirmModal
            onConfirm={deleteContact}
            onClose={() => setIsDeleteContactModalOpen(false)}
            Icon={UserMinus}
            narrow
          >
            {t('Are you sure you want to remove "{{ contactName }}" from your contact list?', {
              contactName: contact.name
            })}
          </ConfirmModal>
        )}
      </ModalPortal>
    </>
  )
}

export default ContactFormModal
