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

interface ForgetAddressButtonProps {
  addressHash: AddressHash
  addressName: string
}

const ForgetAddressButton = ({ addressHash, addressName }: ForgetAddressButtonProps) => {
  const { t } = useTranslation()
  const { hash: defaultAddressHash } = useAppSelector(selectDefaultAddress)
  const isDefault = addressHash === defaultAddressHash

  const deleteAddress = useDeleteAddress()
  const handleDeletePress = useConfirmDeleteAddresses({
    onConfirm: () => deleteAddress(addressHash),
    confirmationText: t('Are you sure you want to remove "{{ address }}" from your address list?', {
      address: addressName
    })
  })

  if (isDefault)
    return (
      <div
        data-tooltip-id="default"
        data-tooltip-content={t('To forget this address set another one as the default one first.')}
        style={{ width: '100%' }}
      >
        <ModalFooterButton role="secondary" variant="alert" disabled={true}>
          {t('Forget')}
        </ModalFooterButton>
      </div>
    )

  return (
    <ModalFooterButton role="secondary" variant="alert" onClick={handleDeletePress} disabled={isDefault}>
      {t('Forget')}
    </ModalFooterButton>
  )
}

export default ForgetAddressButton
