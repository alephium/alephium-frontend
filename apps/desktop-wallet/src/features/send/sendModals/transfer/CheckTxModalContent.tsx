import { useTranslation } from 'react-i18next'

import { openModal } from '@/features/modals/modalActions'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CheckTxProps, TransferTxData } from '@/features/send/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

const TransferCheckTxModalContent = ({ data, fees, onSubmit, onBack, dAppUrl }: CheckTxProps<TransferTxData>) => {
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
        <CheckAmountsBox assetAmounts={data.assetAmounts} hasBg hasHorizontalPadding />
        <CheckAddressesBox
          fromAddress={data.fromAddress}
          toAddressHash={data.toAddress}
          dAppUrl={dAppUrl}
          hasBg
          hasHorizontalPadding
        />
        {data.lockTime && <CheckLockTimeBox lockTime={data.lockTime} />}
        <CheckWorthBox assetAmounts={data.assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />
      </CheckModalContent>

      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onBack}>
          {t('Back')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleButtonPress}>{t(passwordRequirement ? 'Confirm' : 'Send')}</ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default TransferCheckTxModalContent
