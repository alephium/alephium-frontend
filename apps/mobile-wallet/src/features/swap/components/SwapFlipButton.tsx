import Ionicons from '@expo/vector-icons/Ionicons'
import styled, { useTheme } from 'styled-components/native'

interface SwapFlipButtonProps {
  onPress: () => void
  disabled?: boolean
}

const SwapFlipButton = ({ onPress, disabled }: SwapFlipButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonContainer onPress={onPress} hitSlop={10} disabled={disabled}>
      <Ionicons name="swap-vertical" size={20} color={theme.font.primary} />
    </ButtonContainer>
  )
}

export default SwapFlipButton

const ButtonContainer = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-self: center;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.back1};
  border: 3px solid ${({ theme }) => theme.bg.back2};
`
