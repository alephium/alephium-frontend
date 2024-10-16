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
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import useConfirmDeleteAddresses from '@/features/addressDeletion/useConfirmDeleteAddresses'
import useDeleteAddress from '@/features/addressDeletion/useDeleteAddress'
import { useAppSelector } from '@/hooks/redux'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'

interface ForgetAddressSectionProps {
  addressHash: AddressHash
  addressName: string
}

const ForgetAddressSection = ({ addressHash, addressName }: ForgetAddressSectionProps) => {
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

  return (
    <InlineLabelValueInput
      label={t('forgetAddress_one')}
      description={`${t('Declutter your wallet by removing this address from your lists.')} ${t(
        'Forgetting addresses does not delete your assets in them.'
      )}`}
      InputComponent={
        <div
          data-tooltip-id="default"
          data-tooltip-content={
            isDefault ? t('To forget this address set another one as the default one first.') : undefined
          }
        >
          <Button
            short
            wide
            onClick={handleDeletePress}
            disabled={isDefault}
            role="secondary"
            variant="alert"
            borderless
            style={{ minWidth: 120 }}
            Icon={Trash2}
          >
            {t('Forget')}
          </Button>
        </div>
      }
    />
  )
}

export default ForgetAddressSection
