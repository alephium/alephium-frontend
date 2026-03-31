import { ALPH } from '@alephium/token-list'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'

import AppText from '~/components/AppText'
import { useModalContext } from '~/features/modals/ModalContext'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import useFetchAvailableToStake from '~/features/staking/hooks/useFetchAvailableToStake'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import { previewXAlphForStake } from '~/features/staking/stakingUtils'
import useFungibleTokenAmountInput from '~/hooks/useFungibleTokenAmountInput'
import { showExceptionToast, showToast } from '~/utils/layout'

import StakingActionModal from './StakingActionModal'

const StakeModal = () => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { stakeAlph } = useAlphStaking()
  const { data: availableToStake } = useFetchAvailableToStake()
  const { data: xAlphRate } = useFetchXAlphRate()

  const {
    amount,
    error,
    amountParsed: amountInAttoAlph,
    handleAmountChange,
    handleMax,
    formattedMaxBalance
  } = useFungibleTokenAmountInput({
    maxBalance: availableToStake,
    decimals: ALPH.decimals,
    nativeInputRef: inputRef
  })

  const xAlphToReceive = useMemo(
    () => (amountInAttoAlph ? previewXAlphForStake(amountInAttoAlph, xAlphRate) : ''),
    [amountInAttoAlph, xAlphRate]
  )

  const handleStake = async () => {
    if (!amountInAttoAlph || !!error) return

    setIsLoading(true)

    try {
      await stakeAlph(amountInAttoAlph)
      showToast({ type: 'success', text1: t('Transaction sent') })
      dismissModal()
    } catch (err) {
      showExceptionToast(err, t('Stake ALPH'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StakingActionModal
      title={t('Stake ALPH') as string}
      info={
        <AppText color="secondary" size={13}>
          {t(
            'Stake ALPH to mint xALPH. As Powfi generates ALPH rewards, xALPH value relative to ALPH increases. Your xALPH stays liquid and usable across Alephium DeFi.'
          )}
        </AppText>
      }
      amountLabel={
        <AppText color="secondary" size={13}>
          {t('ALPH amount')}
        </AppText>
      }
      maxAction={
        <AppText color="accent" size={13} semiBold>
          {t('Max')}: {formattedMaxBalance} ALPH
        </AppText>
      }
      onMax={handleMax}
      amount={amount}
      onAmountChange={handleAmountChange}
      error={error}
      inputRef={inputRef}
      receivePreview={
        xAlphToReceive ? (
          <>
            <AppText color="secondary" size={13}>
              {t('You will receive')}
            </AppText>
            <AppText semiBold size={18}>
              ≈ {xAlphToReceive} xALPH
            </AppText>
          </>
        ) : undefined
      }
      primaryButtonTitle={amount ? `${t('Stake')} ${amount} ALPH` : (t('Stake ALPH') as string)}
      onPrimaryPress={handleStake}
      primaryDisabled={!amountInAttoAlph || !!error || isLoading}
      isPrimaryLoading={isLoading}
    />
  )
}

export default StakeModal
