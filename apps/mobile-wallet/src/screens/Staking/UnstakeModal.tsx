import { AddressHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'

import AppText from '~/components/AppText'
import { useModalContext } from '~/features/modals/ModalContext'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
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

  const handleUnstake = async () => {
    if (!amountInAttoXAlph || !!error) return

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
          {t('Max')}: {formattedMaxBalance} xALPH
        </AppText>
      }
      onMax={handleMax}
      amount={amount}
      onAmountChange={handleAmountChange}
      error={error}
      inputRef={inputRef}
      receivePreview={
        alphToReceive ? (
          <>
            <AppText color="secondary" size={13}>
              {t('You will receive (over 30 days)')}
            </AppText>
            <AppText semiBold size={18}>
              ≈ {alphToReceive} ALPH
            </AppText>
          </>
        ) : undefined
      }
      primaryButtonTitle={amount ? `${t('Unstake')} ${amount} xALPH` : t('Unstake xALPH')}
      onPrimaryPress={handleUnstake}
      primaryDisabled={!amountInAttoXAlph || !!error || isLoading}
      isPrimaryLoading={isLoading}
    />
  )
}

export default UnstakeModal
