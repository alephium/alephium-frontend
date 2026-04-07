import { ReactNode, RefObject } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BottomModal2 from '~/features/modals/BottomModal2'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export type StakingActionModalProps = {
  title: string
  info: ReactNode
  amountLabel: ReactNode
  /** Typically “Max: … ALPH” with `AppText` + `t('Max')`. */
  maxAction: ReactNode
  onMax: () => void
  amount: string
  onAmountChange: (value: string) => void
  error: string
  inputRef: RefObject<TextInput | null>
  /** When set, rendered inside the receive preview card. */
  receivePreview?: ReactNode
  primaryButtonTitle: string
  onPrimaryPress: () => void
  primaryDisabled: boolean
  isPrimaryLoading: boolean
}

const StakingActionModal = ({
  title,
  info,
  amountLabel,
  maxAction,
  onMax,
  amount,
  onAmountChange,
  error,
  inputRef,
  receivePreview,
  primaryButtonTitle,
  onPrimaryPress,
  primaryDisabled,
  isPrimaryLoading
}: StakingActionModalProps) => (
  <BottomModal2 title={title}>
    <Content>
      <InfoCard>{info}</InfoCard>

      <InputSection>
        <InputHeader>
          {amountLabel}
          <MaxButton onPress={onMax}>{maxAction}</MaxButton>
        </InputHeader>
        <Input
          inputRef={inputRef}
          label="0.00"
          defaultValue={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
          error={error}
          isInModal
        />
      </InputSection>

      {receivePreview ? <ReceivePreview>{receivePreview}</ReceivePreview> : null}

      <Button
        title={primaryButtonTitle}
        onPress={onPrimaryPress}
        disabled={primaryDisabled}
        loading={isPrimaryLoading}
        variant="highlight"
        wide
      />
    </Content>
  </BottomModal2>
)

export default StakingActionModal

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
