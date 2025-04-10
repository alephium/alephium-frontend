import { ActiveWalletDesktop, getHumanReadableError } from '@alephium/shared'
import { isEmpty } from 'lodash'
import { memo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { newWalletNameStored, walletNameStorageFailed } from '@/storage/wallets/walletActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'
import { isWalletNameValid, requiredErrorMessage } from '@/utils/form-validation'

type FormData = {
  name: ActiveWalletDesktop['name']
}

const EditWalletNameModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const { control, handleSubmit, formState } = useForm<FormData>({
    defaultValues: { name: activeWallet.name },
    mode: 'onChange'
  })
  const { sendAnalytics } = useAnalytics()

  const errors = formState.errors
  const isFormValid = isEmpty(errors)

  const onClose = () => dispatch(closeModal({ id }))

  const saveWalletName = (data: FormData) => {
    if (!activeWallet.id) return

    try {
      walletStorage.update(activeWallet.id, data)
      dispatch(newWalletNameStored(data.name))
      onClose()

      sendAnalytics({ event: 'Changed wallet name', props: { wallet_name_length: data.name.length } })
    } catch (error) {
      dispatch(walletNameStorageFailed(getHumanReadableError(error, t('Could not save new wallet name.'))))
      sendAnalytics({ type: 'error', message: 'Could not save new wallet name' })
    }
  }

  return (
    <CenteredModal title={t('Change wallet name')} narrow id={id} hasFooterButtons>
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
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleSubmit(saveWalletName)} disabled={!isFormValid}>
          {t('Save')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default EditWalletNameModal
