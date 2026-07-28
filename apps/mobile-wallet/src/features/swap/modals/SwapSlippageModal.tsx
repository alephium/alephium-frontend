import { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import {
  MAX_SWAP_SLIPPAGE,
  SWAP_SLIPPAGE_FAIL_WARNING,
  SWAP_SLIPPAGE_FRONTRUN_WARNING,
  SWAP_SLIPPAGE_OPTIONS
} from '~/features/swap/swapConstants'
import { swapSlippageChanged } from '~/features/swap/swapSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const fractionToPercentString = (fraction: number) => (fraction * 100).toString()

const SwapSlippageModal = memo(() => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()
  const slippage = useAppSelector((s) => s.swap.slippage)
  const inputRef = useRef<TextInput>(null)

  const isPreset = SWAP_SLIPPAGE_OPTIONS.includes(slippage)

  const handleOptionPress = (fraction: number) => {
    inputRef.current?.setNativeProps({ text: '' })
    dispatch(swapSlippageChanged(fraction))
  }

  const handleCustomChange = (value: string) => {
    const percent = Number(value.replace(',', '.'))

    if (!Number.isFinite(percent) || percent <= 0) return

    dispatch(swapSlippageChanged(Math.min(percent / 100, MAX_SWAP_SLIPPAGE)))
  }

  const warning =
    slippage > SWAP_SLIPPAGE_FRONTRUN_WARNING
      ? t('Your transaction may be frontrun and result in an unfavorable trade.')
      : slippage < SWAP_SLIPPAGE_FAIL_WARNING
        ? t('Your transaction may fail.')
        : undefined

  return (
    <BottomModal title={t('Slippage tolerance')} notScrollable>
      <Content>
        <AppText color="secondary" size={13}>
          {t('Your swap will fail if the price moves more than this while the transaction is pending.')}
        </AppText>

        <Options>
          {SWAP_SLIPPAGE_OPTIONS.map((option) => (
            <Button
              key={option}
              title={`${option * 100}%`}
              onPress={() => handleOptionPress(option)}
              variant={isPreset && slippage === option ? 'highlight' : 'default'}
              flex
              short
            />
          ))}
        </Options>

        <Input
          inputRef={inputRef}
          label={t('Custom (%)')}
          defaultValue={isPreset ? '' : fractionToPercentString(slippage)}
          onChangeText={handleCustomChange}
          keyboardType="decimal-pad"
          isInModal
        />

        {warning && (
          <AppText color="alert" size={13}>
            {warning}
          </AppText>
        )}

        <Button title={t('Done')} onPress={dismissModal} variant="highlight" wide />
      </Content>
    </BottomModal>
  )
})

export default SwapSlippageModal

const Content = styled.View`
  gap: ${DEFAULT_MARGIN}px;
`

const Options = styled.View`
  flex-direction: row;
  gap: 8px;
`
