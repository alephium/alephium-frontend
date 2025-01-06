import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import { openModal } from '@/features/modals/modalActions'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLocktimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const TransferCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<TransferTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)
  const dispatch = useAppDispatch()

  const handleButtonPress = () => {
    data.lockTime
      ? dispatch(openModal({ name: 'ConfirmLockTimeModal', props: { lockTime: data.lockTime, onSubmit } }))
      : onSubmit()
  }

  return (
    <>
      <CheckModalContent>
        <CheckAmountsBox assetAmounts={data.assetAmounts} />
        <CheckWorthBox assetAmounts={data.assetAmounts} />
        <CheckAddressesBox fromAddress={data.fromAddress} toAddressHash={data.toAddress} />
        <CheckFeeLocktimeBox fee={fees} lockTime={data.lockTime} />
      </CheckModalContent>
      <FooterButton onClick={handleButtonPress}>{t(settings.passwordRequirement ? 'Confirm' : 'Send')}</FooterButton>
    </>
  )
}

export default TransferCheckTxModalContent
