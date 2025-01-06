import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CallContractTxData, CheckTxProps } from '@/features/send/sendTypes'
import { useAppSelector } from '@/hooks/redux'

const CallContractCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<CallContractTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)

  return (
    <>
      <CheckModalContent>
        {data.assetAmounts && <CheckAmountsBox assetAmounts={data.assetAmounts} />}
        {data.assetAmounts && <CheckWorthBox assetAmounts={data.assetAmounts} />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        <CheckFeeLockTimeBox fee={fees} />
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </CheckModalContent>
      <FooterButton onClick={onSubmit} variant={settings.passwordRequirement ? 'default' : 'valid'}>
        {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
    </>
  )
}

export default CallContractCheckTxModalContent
