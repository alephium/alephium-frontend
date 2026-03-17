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
import useFetchXAlphBalance from '~/features/staking/hooks/useFetchXAlphBalance'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import { formatTokenAmount } from '~/features/staking/stakingUtils'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'
import { isNumericStringValid } from '~/utils/numbers'

const UnstakeModal = () => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const inputRef = useRef<TextInput>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { startUnstake } = useAlphStaking()
  const { data: xAlphRate } = useFetchXAlphRate()
  const { data: xAlphBalance } = useFetchXAlphBalance()
  const maxUnstakeAmount = useMemo(() => toHumanReadableAmount(xAlphBalance, ALPH.decimals), [xAlphBalance])
  const formattedXAlphBalance = formatTokenAmount(xAlphBalance, ALPH.decimals)

  const amountInWei = useMemo(() => {
    if (!amount || error) return undefined

    try {
      return convertAlphAmountWithDecimals(amount)
    } catch {
      return undefined
    }
  }, [amount, error])

  const alphToReceive = useMemo(() => {
    if (!amountInWei) return ''

    return new Decimal(amountInWei.toString())
      .mul(xAlphRate)
      .div(new Decimal(10).pow(ALPH.decimals))
      .toDecimalPlaces(4, Decimal.ROUND_DOWN)
      .toString()
  }, [amountInWei, xAlphRate])

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

    const exceedsAvailable = parsedAmount ? parsedAmount > xAlphBalance : false

    setError(
      tooManyDecimals
        ? t('This asset cannot have more than {{ numberOfDecimals }} decimals', { numberOfDecimals: ALPH.decimals })
        : exceedsAvailable
          ? t('Amount exceeds available balance')
          : ''
    )
    setAmount(cleanedAmount)
  }

  const handleUnstake = async () => {
    if (!amountInWei || !!error) return

    setIsLoading(true)

    try {
      await startUnstake(amountInWei)
      showToast({ type: 'success', text1: t('Transaction sent') })
      dismissModal()
    } catch (error) {
      showExceptionToast(error, t('Unstake xALPH'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMax = () => {
    setAmount(maxUnstakeAmount)
    setError('')
    inputRef.current?.setNativeProps({ text: maxUnstakeAmount })
  }

  return (
    <BottomModal2 title={t('Unstake xALPH') as string} contentVerticalGap>
      <Content>
        <InfoCard>
          <AppText color="secondary" size={13}>
            {t(
              'Your ALPH will be claimable linearly over 30 days. For faster unstake, you can swap your xALPH using the DEX at the live market price.'
            )}
          </AppText>
        </InfoCard>

        <InputSection>
          <InputHeader>
            <AppText color="secondary" size={13}>
              {t('xALPH amount')}
            </AppText>
            <MaxButton onPress={handleMax}>
              <AppText color="accent" size={13} semiBold>
                {t('Max')}: {formattedXAlphBalance} xALPH
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

        {!!alphToReceive && (
          <ReceivePreview>
            <AppText color="secondary" size={13}>
              {t('You will receive (over 30 days)')}
            </AppText>
            <AppText semiBold size={18}>
              ≈ {alphToReceive} ALPH
            </AppText>
          </ReceivePreview>
        )}

        <Button
          title={amount ? `${t('Unstake')} ${amount} xALPH` : (t('Unstake xALPH') as string)}
          onPress={handleUnstake}
          disabled={!amountInWei || !!error || isLoading}
          loading={isLoading}
          variant="highlight"
          wide
        />
      </Content>
    </BottomModal2>
  )
}

export default UnstakeModal

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
