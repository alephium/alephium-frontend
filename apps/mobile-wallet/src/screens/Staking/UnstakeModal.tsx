import { ALPH } from '@alephium/token-list'
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
import { previewAlphForUnstake } from '~/features/staking/stakingUtils'
import useFungibleTokenAmountInput from '~/hooks/useFungibleTokenAmountInput'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'

const UnstakeModal = () => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { startUnstake } = useAlphStaking()
  const { data: xAlphRate } = useFetchXAlphRate()
  const { data: xAlphBalance } = useFetchXAlphBalance()

  const {
    amount,
    error,
    amountParsed: amountInWei,
    handleAmountChange,
    handleMax,
    formattedMaxBalance
  } = useFungibleTokenAmountInput({
    maxBalance: xAlphBalance,
    decimals: ALPH.decimals,
    nativeInputRef: inputRef
  })

  const alphToReceive = useMemo(
    () => (amountInWei ? previewAlphForUnstake(amountInWei, xAlphRate) : ''),
    [amountInWei, xAlphRate]
  )

  const handleUnstake = async () => {
    if (!amountInWei || !!error) return

    setIsLoading(true)

    try {
      await startUnstake(amountInWei)
      showToast({ type: 'success', text1: t('Transaction sent') })
      dismissModal()
    } catch (err) {
      showExceptionToast(err, t('Unstake xALPH'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BottomModal2 title={t('Unstake xALPH') as string}>
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
                {t('Max')}: {formattedMaxBalance} xALPH
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
