import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { openModal } from '@/features/modals/modalActions'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLocktimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

const TransferCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<TransferTxData>) => {
  const { t } = useTranslation()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const dispatch = useAppDispatch()

  const handleButtonPress = () => {
    data.lockTime
      ? dispatch(openModal({ name: 'ConfirmLockTimeModal', props: { lockTime: data.lockTime, onSubmit } }))
      : onSubmit()
  }

  return (
    <>
      <CheckModalContent>
        <CheckAmountsBoxStyled assetAmounts={data.assetAmounts} />
        <CheckWorthBox assetAmounts={data.assetAmounts} />
        <CheckAddressesBox fromAddress={data.fromAddress} toAddressHash={data.toAddress} />
        <CheckFeeLocktimeBox fee={fees} lockTime={data.lockTime} />
      </CheckModalContent>

      <ModalFooterButtons>
        <ModalFooterButton onClick={handleButtonPress}>{t(passwordRequirement ? 'Confirm' : 'Send')}</ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default TransferCheckTxModalContent

const CheckAmountsBoxStyled = styled(CheckAmountsBox)`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 0 var(--spacing-2);
`
