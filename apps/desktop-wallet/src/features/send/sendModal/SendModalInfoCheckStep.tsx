import { formatAmountForDisplay, MAXIMAL_GAS_FEE } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { openModal } from '@/features/modals/modalActions'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckLockTimeBox from '@/features/send/CheckLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { CheckTxProps } from '@/features/send/sendModal/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { SignChainedTxModalContent } from '@/features/walletConnect/SignChainedTxModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

const SendModalInfoCheckStep = ({ data, fees, onSubmit, onBack, dAppUrl, chainedTxProps }: CheckTxProps) => {
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
        {chainedTxProps ? (
          <>
            <InfoBox
              importance="accent"
              text={t(
                "The origin address doesn't have enough ALPH for gas fees. But don't you worry, {{ amount }} ALPH will be automatically transferred from another address in your wallet!",
                {
                  amount: formatAmountForDisplay({
                    amount: MAXIMAL_GAS_FEE,
                    amountDecimals: ALPH.decimals,
                    displayDecimals: 2
                  })
                }
              )}
            />
            <SignChainedTxModalContent props={chainedTxProps} dAppUrl={dAppUrl} />
          </>
        ) : (
          <>
            <CheckAmountsBox assetAmounts={data.assetAmounts} hasBg hasHorizontalPadding />
            <CheckAddressesBox
              fromAddressStr={data.fromAddress.hash}
              toAddressHash={data.toAddress}
              dAppUrl={dAppUrl}
              hasBg
              hasHorizontalPadding
            />
            {data.lockTime && <CheckLockTimeBox lockTime={data.lockTime} />}
            <CheckWorthBox assetAmounts={data.assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />
          </>
        )}
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

export default SendModalInfoCheckStep
