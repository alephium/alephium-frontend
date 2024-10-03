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

import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import useConfirmDeleteAddresses from '@/features/addressDeletion/useConfirmDeleteAddresses'
import useDeleteAddress from '@/features/addressDeletion/useDeleteAddress'
import { useAppSelector } from '@/hooks/redux'
import { ModalFooterButton } from '@/modals/CenteredModal'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

interface ForgetMulitpleAddressesButtonProps {
  addressHashes: AddressHash[]
  isLoading: boolean
}

const ForgetMulitpleAddressesButton = ({ addressHashes, isLoading }: ForgetMulitpleAddressesButtonProps) => {
  const { t } = useTranslation()
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)

  const deleteAddress = useDeleteAddress()

  const handleDeletePress = useConfirmDeleteAddresses({
    onConfirm: () => addressHashes.filter((hash) => hash !== defaultAddressHash).forEach(deleteAddress),
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
