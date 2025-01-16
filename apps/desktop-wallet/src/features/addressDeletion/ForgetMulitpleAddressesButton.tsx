import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import useConfirmDeleteAddresses from '@/features/addressDeletion/useConfirmDeleteAddresses'
import useDeleteAddress from '@/features/addressDeletion/useDeleteAddress'
import { closeModal } from '@/features/modals/modalActions'
import { ModalInstance } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ModalFooterButton } from '@/modals/CenteredModal'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

interface ForgetMulitpleAddressesButtonProps {
  addressHashes: AddressHash[]
  isLoading: boolean
  modalId: ModalInstance['id']
}

const ForgetMulitpleAddressesButton = ({ addressHashes, isLoading, modalId }: ForgetMulitpleAddressesButtonProps) => {
  const { t } = useTranslation()
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const dispatch = useAppDispatch()

  const deleteAddress = useDeleteAddress()

  const handleDeletePress = useConfirmDeleteAddresses({
    onConfirm: () => {
      addressHashes.filter((hash) => hash !== defaultAddressHash).forEach(deleteAddress)
      dispatch(closeModal({ id: modalId }))
    },
    confirmationText: t('This will remove {{ num }} address(es) from your address list.', {
      num: addressHashes.length
    })
  })

  return (
    <ModalFooterButton onClick={handleDeletePress} disabled={isLoading || addressHashes.length === 0}>
      {t('Forget selected addresses')}
    </ModalFooterButton>
  )
}

export default ForgetMulitpleAddressesButton
