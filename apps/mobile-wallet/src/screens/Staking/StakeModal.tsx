import { AddressHash } from '@alephium/shared'
import { useFetchAddressBalancesAlph } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'

import AppText from '~/components/AppText'
import { useModalContext } from '~/features/modals/ModalContext'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import useFungibleTokenAmountInput from '~/hooks/useFungibleTokenAmountInput'
import StakeModalReceivePreview from '~/screens/Staking/StakeModalReceivePreview'
import { showExceptionToast, showToast } from '~/utils/layout'

import StakingActionModal from './StakingActionModal'

interface StakeModalProps {
  addressHash: AddressHash
}

const StakeModal = ({ addressHash }: StakeModalProps) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { stakeAlph } = useAlphStaking()
  const { data: alphBalances } = useFetchAddressBalancesAlph({ addressHash })

  const {
    amount,
    error,
    amountParsed: amountInAttoAlph,
    handleAmountChange,
    handleMax,
    formattedMaxBalance
  } = useFungibleTokenAmountInput({
    maxBalance: BigInt(alphBalances?.availableBalance ?? 0),
    decimals: ALPH.decimals,
    nativeInputRef: inputRef
  })

  const handleStake = async () => {
    if (!amountInAttoAlph || !!error) return

    setIsLoading(true)

    try {
      showToast({ type: 'info', text1: t('Staking ALPH...') })
      await stakeAlph(amountInAttoAlph)
      dismissModal()
    } catch (err) {
      showExceptionToast(err, t('Stake ALPH'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StakingActionModal
      title={t('Stake ALPH')}
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
          {t('Max: {{amount}} ALPH', { amount: formattedMaxBalance })}
        </AppText>
      }
      onMax={handleMax}
      amount={amount}
      onAmountChange={handleAmountChange}
      error={error}
      inputRef={inputRef}
      receivePreview={
        amountInAttoAlph !== undefined ? <StakeModalReceivePreview alphAmount={amountInAttoAlph} /> : null
      }
      primaryButtonTitle={amount ? t('Stake {{amount}} ALPH', { amount }) : t('Stake ALPH')}
      onPrimaryPress={handleStake}
      primaryDisabled={!amountInAttoAlph || !!error || isLoading}
      isPrimaryLoading={isLoading}
    />
  )
}

export default StakeModal
