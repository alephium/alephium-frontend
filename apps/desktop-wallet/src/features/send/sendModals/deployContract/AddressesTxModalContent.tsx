import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AddressInputs from '@/features/send/AddressInputs'
import { DeployContractTxModalData } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { ModalContent } from '@/modals/CenteredModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface DeployContractAddressesTxModalContentProps {
  data: DeployContractTxModalData
  onSubmit: (data: DeployContractTxModalData) => void
  onCancel: () => void
}

const DeployContractAddressesTxModalContent = ({
  data,
  onSubmit,
  onCancel
}: DeployContractAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const { data: fromAddresses } = useFetchAddressesHashesWithBalance()

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
      <FooterButton onClick={() => onSubmit({ fromAddress })}>{t('Continue')}</FooterButton>
    </ModalContent>
  )
}

export default DeployContractAddressesTxModalContent
