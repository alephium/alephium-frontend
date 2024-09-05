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

import { useAddressesTotalAlphBalances } from '@/api/addressesBalancesDataHooks'
import FooterButton from '@/components/Buttons/FooterButton'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { useAddressesWithBalance } from '@/features/addressFiltering/addressFilteringHooks'
import { useAppSelector } from '@/hooks/redux'
import { ModalContent } from '@/modals/CenteredModal'
import AddressInputs from '@/modals/SendModals/AddressInputs'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { DeployContractTxData, PartialTxData } from '@/types/transactions'

interface DeployContractAddressesTxModalContentProps {
  data: PartialTxData<DeployContractTxData, 'fromAddress'>
  onSubmit: (data: PartialTxData<DeployContractTxData, 'fromAddress'>) => void
  onCancel: () => void
}

const DeployContractAddressesTxModalContent = ({
  data,
  onSubmit,
  onCancel
}: DeployContractAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const fromAddresses = useAddressesWithBalance()
  const { isLoading: isLoadingAlphBalances } = useAddressesTotalAlphBalances()

  const [fromAddressHash, setFromAddressHash] = useState(data.fromAddress.hash)
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  return (
    <ModalContent>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddressHash}
          fromAddresses={fromAddresses}
          onFromAddressChange={setFromAddressHash}
        />
      </InputFieldsColumn>
      <FooterButton onClick={() => onSubmit({ fromAddress })} disabled={isLoadingAlphBalances}>
        {t('Continue')}
      </FooterButton>
    </ModalContent>
  )
}

export default DeployContractAddressesTxModalContent
