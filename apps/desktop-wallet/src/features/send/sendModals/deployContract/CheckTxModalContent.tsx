import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckFeeLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import InfoRow from '@/features/send/InfoRow'
import { CheckTxProps, DeployContractTxData } from '@/features/send/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppSelector } from '@/hooks/redux'

const DeployContractCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<DeployContractTxData>) => {
  const { t } = useTranslation()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)

  return (
    <>
      <CheckModalContent>
        {data.initialAlphAmount && (
          <>
            <CheckAmountsBox assetAmounts={[data.initialAlphAmount]} hasBg hasPadding />
            <CheckWorthBox assetAmounts={[data.initialAlphAmount]} />
          </>
        )}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        {data.issueTokenAmount && (
          <Box>
            <InfoRow label={t('Issue token amount')}>{data.issueTokenAmount}</InfoRow>
          </Box>
        )}
        <CheckFeeLockTimeBox fee={fees} />
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </CheckModalContent>
      <FooterButton onClick={onSubmit} variant={passwordRequirement ? 'default' : 'valid'}>
        {t(passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
    </>
  )
}

export default DeployContractCheckTxModalContent
