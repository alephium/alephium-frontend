import { AddressHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'

import AppText from '~/components/AppText'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { useModalContext } from '~/features/modals/ModalContext'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import useFetchXAlphBalance from '~/features/staking/hooks/useFetchXAlphBalance'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import { previewAlphForUnstake } from '~/features/staking/stakingUtils'
import useFungibleTokenAmountInput from '~/hooks/useFungibleTokenAmountInput'
import { showExceptionToast, showToast } from '~/utils/layout'

import StakingActionModal from './StakingActionModal'

interface UnstakeModalProps {
  addressHash: AddressHash
}

const UnstakeModal = ({ addressHash }: UnstakeModalProps) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { startUnstake } = useAlphStaking()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { data: xAlphRate } = useFetchXAlphRate()
  const { data: xAlphBalance } = useFetchXAlphBalance(addressHash)

  const {
    amount,
    error,
    amountParsed: amountInAttoXAlph,
    handleAmountChange,
    handleMax,
    formattedMaxBalance
  } = useFungibleTokenAmountInput({
    maxBalance: xAlphBalance,
    decimals: ALPH.decimals,
    nativeInputRef: inputRef
  })

  const alphToReceive = useMemo(
    () => (amountInAttoXAlph ? previewAlphForUnstake(amountInAttoXAlph, xAlphRate) : ''),
    [amountInAttoXAlph, xAlphRate]
  )

  const handleUnstake = () => {
    if (!amountInAttoXAlph || !!error) return

    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: async () => {
            setIsLoading(true)

            try {
              showToast({ type: 'info', text1: t('Opening ALPH unstake request...') })
              await startUnstake(amountInAttoXAlph)
              dismissModal()
            } catch (err) {
              showExceptionToast(err, t('Unstake xALPH'))
            } finally {
              setIsLoading(false)
            }
          }
        })
    })
  }

  return (
    <StakingActionModal
      title={t('Unstake xALPH')}
      info={
        <AppText color="secondary" size={13}>
          {t(
            'Your ALPH will be claimable linearly over 30 days. For faster unstake, you can swap your xALPH using the DEX at the live market price.'
          )}
        </AppText>
      }
      amountLabel={
        <AppText color="secondary" size={13}>
          {t('xALPH amount')}
        </AppText>
      }
      maxAction={
        <AppText color="accent" size={13} semiBold>
          {t('Max: {{amount}} xALPH', { amount: formattedMaxBalance })}
        </AppText>
      }
      onMax={handleMax}
      amount={amount}
      onAmountChange={handleAmountChange}
      error={error}
      inputRef={inputRef}
      receivePreview={
        alphToReceive ? (
          <Trans
            t={t}
            i18nKey="unstakeXAlphReceivePreview"
            values={{ amount: alphToReceive }}
            components={{
              1: <AppText color="secondary" size={13} />,
              2: <AppText semiBold size={18} />
            }}
          >
            {'<1>You will receive (over 30 days)</1><2>≈ {{amount}} ALPH</2>'}
          </Trans>
        ) : undefined
      }
      primaryButtonTitle={amount ? t('Unstake {{amount}} xALPH', { amount }) : t('Unstake xALPH')}
      onPrimaryPress={handleUnstake}
      primaryDisabled={!amountInAttoXAlph || !!error || isLoading}
      isPrimaryLoading={isLoading}
    />
  )
}

export default UnstakeModal
