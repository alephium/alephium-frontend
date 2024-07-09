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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAddressesWithSomeBalance } from '@/api/apiHooks'
import FooterButton from '@/components/Buttons/FooterButton'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { ModalContent } from '@/modals/CenteredModal'
import AddressInputs from '@/modals/SendModals/AddressInputs'
import { CallContractTxData, PartialTxData } from '@/types/transactions'

interface CallContractAddressesTxModalContentProps {
  data: PartialTxData<CallContractTxData, 'fromAddress'>
  onSubmit: (data: PartialTxData<CallContractTxData, 'fromAddress'>) => void
  onCancel: () => void
}

const CallContractAddressesTxModalContent = ({
  data,
  onSubmit,
  onCancel
}: CallContractAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const { data: addresses } = useAddressesWithSomeBalance()

  const [fromAddress, setFromAddress] = useState(data.fromAddress)

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  return (
    <ModalContent>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddress}
          fromAddresses={addresses}
          onFromAddressChange={setFromAddress}
        />
      </InputFieldsColumn>
      <FooterButton onClick={() => onSubmit({ fromAddress })}>{t('Continue')}</FooterButton>
    </ModalContent>
  )
}

export default CallContractAddressesTxModalContent
