import { selectAddressByHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AddressInputs from '@/features/send/AddressInputs'
import { CallContractTxModalData } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

interface CallContractAddressesTxModalContentProps {
  data: CallContractTxModalData
  onSubmit: (data: CallContractTxModalData) => void
  onCancel: () => void
}

const CallContractAddressesTxModalContent = ({
  data,
  onSubmit,
  onCancel
}: CallContractAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const { data: allAddressHashes } = useFetchAddressesHashesSortedByLastUse()

  const [fromAddressHash, setFromAddressHash] = useState(data.fromAddress.hash)
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  return (
    <>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddressHash}
          fromAddresses={allAddressHashes}
          onFromAddressChange={setFromAddressHash}
        />
      </InputFieldsColumn>
      <ModalFooterButtons>
        <ModalFooterButton onClick={() => onSubmit({ fromAddress })}>{t('Continue')}</ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default CallContractAddressesTxModalContent
