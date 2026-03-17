import { getNumberOfDecimals, toHumanReadableAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { convertAlphAmountWithDecimals } from '@alephium/web3'
import Decimal from 'decimal.js'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import useAlphStaking from '~/features/staking/hooks/useAlphStaking'
import useFetchAvailableToStake from '~/features/staking/hooks/useFetchAvailableToStake'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import { formatTokenAmount } from '~/features/staking/stakingUtils'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'
import { isNumericStringValid } from '~/utils/numbers'

const StakeModal = () => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const inputRef = useRef<TextInput>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { stakeAlph } = useAlphStaking()
  const { data: availableToStake } = useFetchAvailableToStake()
  const { data: xAlphRate } = useFetchXAlphRate()
  const maxStakeAmount = useMemo(() => toHumanReadableAmount(availableToStake, ALPH.decimals), [availableToStake])
  const formattedAvailableToStake = formatTokenAmount(availableToStake, ALPH.decimals)

  const amountInAttoAlph = useMemo(() => {
    if (!amount || error) return undefined

    try {
      return convertAlphAmountWithDecimals(amount)
    } catch {
      return undefined
    }
  }, [amount, error])

  const xAlphToReceive = useMemo(() => {
    if (!amountInAttoAlph || xAlphRate.lte(0)) return ''

    return new Decimal(amountInAttoAlph.toString())
      .div(xAlphRate)
      .div(new Decimal(10).pow(ALPH.decimals))
      .toDecimalPlaces(4, Decimal.ROUND_DOWN)
      .toString()
  }, [amountInAttoAlph, xAlphRate])

  const handleAmountChange = (value: string) => {
    let cleanedAmount = value.replace(',', '.')
    cleanedAmount = isNumericStringValid(cleanedAmount, true) ? cleanedAmount : ''

    const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > ALPH.decimals
    let parsedAmount: bigint | undefined

    if (cleanedAmount && !tooManyDecimals) {
      try {
        parsedAmount = convertAlphAmountWithDecimals(cleanedAmount)
      } catch {
        parsedAmount = undefined
      }
    }

    const exceedsAvailable = parsedAmount ? parsedAmount > availableToStake : false

    setError(
      tooManyDecimals
        ? t('This asset cannot have more than {{ numberOfDecimals }} decimals', { numberOfDecimals: ALPH.decimals })
        : exceedsAvailable
          ? t('Amount exceeds available balance')
          : ''
    )
    setAmount(cleanedAmount)
  }

  const handleStake = async () => {
    if (!amountInAttoAlph || !!error) return

    setIsLoading(true)

    try {
      await stakeAlph(amountInAttoAlph)
      showToast({ type: 'success', text1: t('Transaction sent') })
      dismissModal()
    } catch (error) {
      showExceptionToast(error, t('Stake ALPH'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMax = () => {
    setAmount(maxStakeAmount)
    setError('')
    inputRef.current?.setNativeProps({ text: maxStakeAmount })
  }

  return (
    <BottomModal2 title={t('Stake ALPH') as string}>
      <Content>
        <InfoCard>
          <AppText color="secondary" size={13}>
            {t(
              'Stake ALPH to mint xALPH. As Powfi generates ALPH rewards, xALPH value relative to ALPH increases. Your xALPH stays liquid and usable across Alephium DeFi.'
            )}
          </AppText>
        </InfoCard>

        <InputSection>
          <InputHeader>
            <AppText color="secondary" size={13}>
              {t('ALPH amount')}
            </AppText>
            <MaxButton onPress={handleMax}>
              <AppText color="accent" size={13} semiBold>
                {t('Max')}: {formattedAvailableToStake} ALPH
              </AppText>
            </MaxButton>
          </InputHeader>
          <Input
            inputRef={inputRef}
            label="0.00"
            defaultValue={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            error={error}
            isInModal
          />
        </InputSection>

        {!!xAlphToReceive && (
          <ReceivePreview>
            <AppText color="secondary" size={13}>
              {t('You will receive')}
            </AppText>
            <AppText semiBold size={18}>
              ≈ {xAlphToReceive} xALPH
            </AppText>
          </ReceivePreview>
        )}

        <Button
          title={amount ? `${t('Stake')} ${amount} ALPH` : (t('Stake ALPH') as string)}
          onPress={handleStake}
          disabled={!amountInAttoAlph || !!error || isLoading}
          loading={isLoading}
          variant="highlight"
          wide
        />
      </Content>
    </BottomModal2>
  )
}

export default StakeModal

const Content = styled.View`
  gap: ${DEFAULT_MARGIN}px;
`

const InfoCard = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 12px;
  padding: ${DEFAULT_MARGIN}px;
`

const InputSection = styled.View`
  gap: 8px;
`

const InputHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const MaxButton = styled.Pressable``

const ReceivePreview = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 12px;
  padding: ${DEFAULT_MARGIN}px;
  gap: 4px;
`
