import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CallContractTxData, CheckTxProps } from '@/features/send/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

const CallContractCheckTxModalContent = ({ data, fees, onSubmit, onBack }: CheckTxProps<CallContractTxData>) => {
  const { t } = useTranslation()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)

  return (
    <>
      <CheckModalContent>
        {data.assetAmounts && <CheckAmountsBox assetAmounts={data.assetAmounts} hasBg hasPadding />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        {data.assetAmounts && <CheckWorthBox assetAmounts={data.assetAmounts} fee={fees} />}
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </CheckModalContent>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onBack}>
          {t('Back')}
        </ModalFooterButton>
        <ModalFooterButton onClick={onSubmit} variant={passwordRequirement ? 'default' : 'valid'}>
          {t(passwordRequirement ? 'Confirm' : 'Send')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default CallContractCheckTxModalContent
