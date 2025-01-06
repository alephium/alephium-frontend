import Ionicons from '@expo/vector-icons/Ionicons'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { PopInFast, PopOutFast } from '~/animations/reanimated/reanimatedAnimations'

const Checkmark = () => (
  <CheckmarkStyled entering={PopInFast} exiting={PopOutFast}>
    <Ionicons name="checkmark-sharp" color="white" size={16} />
  </CheckmarkStyled>
)

const CheckmarkStyled = styled(Animated.View)`
  width: 22px;
  height: 22px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.global.accent};
  align-items: center;
  justify-content: center;
`

export default Checkmark
