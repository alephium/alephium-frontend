import { selectAddressByHash } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AddressInputs from '@/features/send/AddressInputs'
import { DeployContractTxModalData } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

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

  return (
    <>
      {fromAddresses.length > 0 ? (
        <InputFieldsColumn>
          <AddressInputs
            defaultFromAddress={fromAddressHash}
            fromAddresses={fromAddresses}
            onFromAddressChange={setFromAddressHash}
          />
        </InputFieldsColumn>
      ) : (
        <InfoBox
          text={t(
            'There are no addresses with available balance. Please, send some funds to one of your addresses, and try again.'
          )}
          importance="warning"
          Icon={AlertTriangle}
        />
      )}

      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onCancel}>
          {t('Cancel')}
        </ModalFooterButton>
        {fromAddress && (
          <ModalFooterButton onClick={() => onSubmit({ fromAddress })}>{t('Continue')}</ModalFooterButton>
        )}
      </ModalFooterButtons>
    </>
  )
}

export default DeployContractAddressesTxModalContent
