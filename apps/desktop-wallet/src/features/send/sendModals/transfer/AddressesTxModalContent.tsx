import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import AddressInputs from '@/features/send/AddressInputs'
import { TransferAddressesTxModalOnSubmitData, TransferTxModalData } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'
import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { isAddressValid, requiredErrorMessage } from '@/utils/form-validation'

interface TransferAddressesTxModalContentProps {
  data: TransferTxModalData
  onSubmit: (data: TransferAddressesTxModalOnSubmitData) => void
  onCancel: () => void
}

const TransferAddressesTxModalContent = ({ data, onSubmit, onCancel }: TransferAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const { data: fromAddresses } = useFetchAddressesHashesWithBalance()

  const [fromAddressHash, setFromAddressHash] = useState(data.fromAddress.hash)
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')
  const fromAddress = useAppSelector((s) => selectAddressByHash(s, fromAddressHash))

  useEffect(() => {
    if (fromAddresses.length > 0 && !fromAddresses.find((a) => a === data.fromAddress.hash)) {
      setFromAddressHash(fromAddresses[0])
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
      <InfoBox>{t('Start by selecting the origin and destination addresses.')}</InfoBox>
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
      <FooterButton
        onClick={() =>
          onSubmit({
            fromAddress,
            toAddress: toAddress.value
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Continue')}
      </FooterButton>
    </>
  )
}

export default TransferAddressesTxModalContent

function useStateWithError<T>(initialValue: T) {
  const [value, setValue] = useState({ value: initialValue, error: '' })

  const setValueWithError = useCallback((newValue: T, newError: string) => {
    setValue({ value: newValue, error: newError })
  }, [])

  return [value, setValueWithError] as const
}
