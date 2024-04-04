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

import { getHumanReadableError } from '@alephium/shared'
import { isEmpty } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { CenteredModalProps, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { newWalletNameStored, walletNameStorageFailed } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { ActiveWallet } from '@/types/wallet'
import { isWalletNameValid, requiredErrorMessage } from '@/utils/form-validation'

type FormData = {
  name: ActiveWallet['name']
}

const EditWalletNameModal = (props: CenteredModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { name: activeWallet.name },
    mode: 'onChange'
  })
  const posthog = usePostHog()

  const errors = formState.errors
  const isFormValid = isEmpty(errors)

  const saveWalletName = (data: FormData) => {
    if (!activeWallet.id) return

    try {
      walletStorage.update(activeWallet.id, data)
      dispatch(newWalletNameStored(data.name))
      props.onClose()

      posthog.capture('Changed wallet name', { wallet_name_length: data.name.length })
    } catch (e) {
      dispatch(walletNameStorageFailed(getHumanReadableError(e, t('Could not save new wallet name.'))))
      posthog.capture('Error', { message: 'Could not save new wallet name' })
    }
  }

  return (
    <CenteredModal title={t('Change wallet name')} narrow {...props}>
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
              heightSize="big"
            />
          )}
          rules={{
            required: true,
            validate: (name) => isWalletNameValid({ name, previousName: activeWallet.name })
          }}
          control={control}
        />
      </InputFieldsColumn>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={props.onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleSubmit(saveWalletName)} disabled={!isFormValid}>
          {t('Save')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default EditWalletNameModal
