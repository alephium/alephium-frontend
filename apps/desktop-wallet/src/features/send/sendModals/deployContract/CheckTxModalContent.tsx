import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import InfoBox from '@/components/InfoBox'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import InfoRow from '@/features/send/InfoRow'
import { CheckTxProps, DeployContractTxData } from '@/features/send/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

const DeployContractCheckTxModalContent = ({ data, fees, onSubmit, onBack }: CheckTxProps<DeployContractTxData>) => {
  const { t } = useTranslation()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)

  return (
    <>
      <CheckModalContent>
        {data.initialAlphAmount && <CheckAmountsBox assetAmounts={[data.initialAlphAmount]} hasBg hasPadding />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        {data.issueTokenAmount && (
          <Box>
            <InfoRow label={t('Issue token amount')}>{data.issueTokenAmount}</InfoRow>
          </Box>
        )}
        {data.initialAlphAmount && <CheckWorthBox assetAmounts={[data.initialAlphAmount]} fee={fees} />}
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

export default DeployContractCheckTxModalContent
