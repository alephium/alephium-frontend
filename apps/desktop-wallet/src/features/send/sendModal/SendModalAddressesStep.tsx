import { selectAddressByHash } from '@alephium/shared'
import { useFetchAddressesHashesWithBalance } from '@alephium/shared-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AddressInputs from '@/features/send/sendModal/AddressInputs'
import { TransferAddressesTxModalOnSubmitData, TransferTxModalData } from '@/features/send/sendModal/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { isAddressValid, requiredErrorMessage } from '@/utils/form-validation'

interface SendModalAddressesStepProps {
  data: TransferTxModalData
  onSubmit: (data: TransferAddressesTxModalOnSubmitData) => void
  onCancel: () => void
}

const SendModalAddressesStep = ({ data, onSubmit, onCancel }: SendModalAddressesStepProps) => {
  const { t } = useTranslation()
  const { data: fromAddresses } = useFetchAddressesHashesWithBalance(data.tokenId)

  const [fromAddressHash, setFromAddressHash] = useState(data.fromAddress.hash)
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))

  useEffect(() => {
    if (fromAddresses.length > 0 && !fromAddresses.find((a) => a === data.fromAddress.hash)) {
      const firstAddress = fromAddresses.at(0)

      if (firstAddress) {
        setFromAddressHash(firstAddress)
      }
    }
  }, [data.fromAddress.hash, fromAddresses])

  const handleToAddressChange = useCallback(
    (value: string) => {
      setToAddress(value, !value ? requiredErrorMessage : isAddressValid(value) ? '' : t('This address is not valid'))
    },
    [setToAddress, t]
  )

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive = toAddress.value && !toAddress.error

  return (
    <>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddressHash}
          fromAddresses={fromAddresses}
          onFromAddressChange={setFromAddressHash}
          toAddress={toAddress}
          onToAddressChange={handleToAddressChange}
          onContactSelect={handleToAddressChange}
        />
      </InputFieldsColumn>
      <ModalFooterButtons>
        <ModalFooterButton
          onClick={() =>
            onSubmit({
              fromAddress,
              toAddress: toAddress.value,
              tokenId: data.tokenId
            })
          }
          disabled={!isSubmitButtonActive}
        >
          {t('Continue')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default SendModalAddressesStep

function useStateWithError<T>(initialValue: T) {
  const [value, setValue] = useState({ value: initialValue, error: '' })

  const setValueWithError = useCallback((newValue: T, newError: string) => {
    setValue({ value: newValue, error: newError })
  }, [])

  return [value, setValueWithError] as const
}
